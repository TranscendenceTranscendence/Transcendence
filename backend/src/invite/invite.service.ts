import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GamesService } from '../games/games.service';
import { Invite, InviteStatus } from './invite.entity';
import { Repository, LessThan, In } from 'typeorm';
import { CreateGameDto } from '../games/dto/create-game.dto';
import { GameStatus } from '../games/game.entity';
import { v4 as uuidv4 } from 'uuid';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User, UserStatus } from '../users/user.entity';
import { CreateInviteDto } from './dto/create-invite.dto';

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(Invite)
    private readonly inviteRepository: Repository<Invite>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @Inject(forwardRef(() => GamesService))
    private readonly gamesService: GamesService,
  ) {}

  async createInvite(
    senderUserId: number,
    receiverUserId: number,
  ): Promise<void> {
    if (
      !senderUserId ||
      isNaN(senderUserId) ||
      !receiverUserId ||
      isNaN(receiverUserId)
    ) {
      throw new BadRequestException(
        'One of the passed in arguments it not valid.',
      );
    }

    if (senderUserId === receiverUserId) {
      throw new BadRequestException("You can't invite yourself to a game.");
    }
    if (await this.gamesService.isPlayerInGame(senderUserId))
      throw new BadRequestException(
        "You can't invite someone if you're already in an active game",
      );

    const sentInvites = await this.inviteRepository.find({
      where: {
        senderUserId: senderUserId,
        status: InviteStatus.PENDING,
      },
    });

    if (sentInvites.length > 0)
      throw new BadRequestException(
        "You can't invite multiple people at the same time",
      );

    const game = new CreateGameDto();
    game.room_identifier = uuidv4();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const invite = new CreateInviteDto();
    invite.senderUserId = senderUserId;
    invite.receiverUserId = receiverUserId;
    invite.status = InviteStatus.PENDING;
    invite.gameRoomId = game.room_identifier;
    invite.createdAt = new Date();
    invite.expiresAt = expiresAt;

    try {
      const madeInvite = this.inviteRepository.create(invite);
      const savedInvite = await this.inviteRepository.save(madeInvite);

      game.player1_user_id = senderUserId;
      game.player2_user_id = null;
      game.created_at = new Date();
      game.score = [0, 0];
      game.status = GameStatus.PENDING;
      game.winner_user_id = 0;
      game.invite_id = savedInvite.id;

      const madeGame = await this.gamesService.create(game);
      if (!madeGame) {
        await this.inviteRepository.remove(savedInvite);
        throw new InternalServerErrorException("Couldn't make a game.");
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create invite: ${error.message}`,
      );
    }
  }

  async getPendingInvites(userId: number): Promise<Invite[]> {
    await this.checkExpiredInvites();

    const invites = await this.inviteRepository.find({
      where: {
        receiverUserId: userId,
        status: InviteStatus.PENDING,
      },
    });
    return invites;
  }

  async getSentInvites(userId: number): Promise<Invite[]> {
    const invites = await this.inviteRepository.find({
      where: {
        senderUserId: userId,
        status: InviteStatus.PENDING,
      },
    });
    return invites;
  }

  async acceptInvite(inviteId: number, userId: number): Promise<Invite> {
    if (
      inviteId === undefined ||
      isNaN(inviteId) ||
      userId === undefined ||
      isNaN(userId)
    )
      throw new BadRequestException(
        'Invite ID or User ID is an invalid number',
      );

    const invite = await this.inviteRepository.findOne({
      where: {
        id: inviteId,
        status: InviteStatus.PENDING,
      },
    });
    if (!invite || invite === undefined)
      throw new InternalServerErrorException("Couldn't find any invite");

    const game = await this.gamesService.findByRoomIdentifier(
      invite.gameRoomId,
    );

    if (game.status === GameStatus.CANCELLED) {
      invite.status = InviteStatus.EXPIRED;
      await this.inviteRepository.save(invite);
      throw new BadRequestException('Game has already been canceled');
    }

    game.player2_user_id = invite.receiverUserId;
    invite.status = InviteStatus.ACCEPTED;

    await this.inviteRepository.save(invite);
    await this.gamesService.update(game.id, game);

    return invite;
  }

  async declineInvite(inviteId: number, userId: number): Promise<Invite> {
    if (
      inviteId === undefined ||
      isNaN(inviteId) ||
      userId === undefined ||
      isNaN(userId)
    )
      throw new BadRequestException(
        'Invite ID or User ID is an invalid number',
      );
    const invite = await this.inviteRepository.findOne({
      where: {
        id: inviteId,
        status: InviteStatus.PENDING,
      },
    });
    if (!invite || invite === undefined)
      throw new InternalServerErrorException("Couldn't find any invite");
    const game = await this.gamesService.findByRoomIdentifier(
      invite.gameRoomId,
    );
    game.status = GameStatus.CANCELLED;
    invite.status = InviteStatus.DECLINED;

    await this.inviteRepository.save(invite);
    await this.gamesService.update(game.id, game);

    return invite;
  }

  async checkExpiredInvites(): Promise<void> {
    const now = new Date();

    const expiredInvites = await this.inviteRepository.find({
      where: {
        status: InviteStatus.PENDING,
        expiresAt: LessThan(now),
      },
    });

    for (const invite of expiredInvites) {
      invite.status = InviteStatus.EXPIRED;
      await this.inviteRepository.save(invite);

      try {
        const game = await this.gamesService.findByRoomIdentifier(
          invite.gameRoomId,
        );
        if (game) {
          game.status = GameStatus.CANCELLED;
          await this.gamesService.update(game.id, game);
        }
      } catch (err) {
        console.error(
          `Error updating expired game for invite ${invite.id}:`,
          err,
        );
      }
    }
  }

  async findAllOnlineUsers(userId: number): Promise<User[]> {
    if (isNaN(userId)) {
      console.error(
        'Invalid userId in findAllOnlineUsers:',
        userId,
        'Type:',
        typeof userId,
      );
      return [];
    }

    try {
      const onlineUsers = await this.usersRepository.find({
        where: {
          user_status: In([
            UserStatus.Online,
            UserStatus.Playing,
            UserStatus.Waiting,
          ]),
        },
      });

      return onlineUsers.filter((user) => user.id !== userId);
    } catch (error) {
      console.error('Error finding online users:', error);
      return [];
    }
  }

  async doesGameStillExist(roomId: string): Promise<boolean> {
    try {
      const game = await this.gamesService.findByRoomIdentifier(roomId);
      if (game.status === GameStatus.CANCELLED)
        throw new InternalServerErrorException(
          'Game has already been canceled',
        );
      return true;
    } catch (error) {
      console.error('Error checking if game has been canceled: ', error);
      return false;
    }
  }

  async findInviteById(inviteId: number): Promise<Invite> {
    if (!inviteId || isNaN(inviteId)) {
      throw new BadRequestException('Invalid invite ID');
    }

    const invite = await this.inviteRepository.findOne({
      where: { id: inviteId },
    });

    if (!invite) {
      throw new BadRequestException(`Invite with ID ${inviteId} not found`);
    }

    return invite;
  }

  async setInviteToExpired(inviteId: number): Promise<boolean> {
    try {
      const invite = await this.findInviteById(inviteId);

      invite.status = InviteStatus.EXPIRED;
      await this.inviteRepository.save(invite);

      try {
        const game = await this.gamesService.findByRoomIdentifier(
          invite.gameRoomId,
        );
        if (game && game.status !== GameStatus.CANCELLED) {
          game.status = GameStatus.CANCELLED;
          await this.gamesService.update(game.id, game);
        }
      } catch (gameError) {
        console.error(
          `Error updating game for expired invite ${inviteId}:`,
          gameError,
        );
      }

      return true;
    } catch (error) {
      console.error(`Error setting invite ${inviteId} to expired:`, error);
      return false;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredInvites() {
    try {
      await this.checkExpiredInvites();
    } catch (error) {
      console.error('Error handling expired invites:', error);
    }
  }
}
