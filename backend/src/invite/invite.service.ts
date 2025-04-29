import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GamesService } from 'games/games.service';
import { Invite, InviteStatus } from './invite.entity';
import { Repository } from 'typeorm';
import { CreateGameDto } from 'games/dto/create-game.dto';
import { JwtAccessAuthGuard } from 'auth/guards/jwt-access.guard';
import { GameStatus } from 'games/game.entity';
import { v4 as uuidv4 } from 'uuid';
import { promises } from 'dns';

@Injectable()
export class InviteService {
  constructor(
    @InjectRepository(Invite)
    private readonly inviteRepository: Repository<Invite>,
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

    const game = new CreateGameDto();

    game.player1_user_id = senderUserId;
    game.player2_user_id = null;
    game.room_identifier = uuidv4();
    game.created_at = new Date();
    game.score = [0, 0];
    game.status = GameStatus.PENDING;
    game.winner_user_id = 0;

    const madeGame = await this.gamesService.create(game);

    if (!madeGame)
      throw new InternalServerErrorException("Couldn't make a game.");

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const invite = this.inviteRepository.create({
      senderUserId: senderUserId,
      receiverUserId: receiverUserId,
      status: InviteStatus.PENDING,
      gameRoomId: madeGame.room_identifier,
      createdAt: new Date(),
      expiresAt: expiresAt,
    });

    if (!invite)
      throw new InternalServerErrorException("Couldn't make an invite.");
  }

  async getPendingInvites(userId: number): Promise<Invite[]>
  {
    const invites = this.inviteRepository.find({
        where: {
            receiverUserId: userId
        }
    })
    return invites;
  }
}
