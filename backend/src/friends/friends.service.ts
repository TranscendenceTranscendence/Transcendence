import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend } from './friend.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';

class SendFriendRequestDto {
  @ApiProperty()
  senderId: number;

  @ApiProperty()
  recieverId: number;
}

class GetFriendRequestsDto {
  @ApiProperty()
  recieverId: number;
}

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendsRepository: Repository<Friend>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async sendFriendRequest(request: SendFriendRequestDto) {
    if (request.senderId === request.recieverId) {
      throw new HttpException('Sender and receiver cannot be the same user.', HttpStatus.BAD_REQUEST);
    }

    const [receiver, sender] = await Promise.all([
      this.usersRepository.findOneBy({ id: request.recieverId }),
      this.usersRepository.findOneBy({ id: request.senderId }),
    ]);

    if (!receiver) {
      throw new HttpException('Receiver not found.', HttpStatus.NOT_FOUND);
    }

    if (!sender) {
      throw new HttpException('Sender not found.', HttpStatus.NOT_FOUND);
    }

    const existingRequest = await this.friendsRepository.findOneBy({
      sender: sender,
      receiver: receiver,
    });

    if (existingRequest) {
      throw new HttpException('Friend request already exists.', HttpStatus.CONFLICT);
    }

    const newFriend = this.friendsRepository.create({
      receiver,
      sender,
    });

    try {
      await this.friendsRepository.save(newFriend);
      return { message: 'Friend request sent successfully.' };
    } catch {
      throw new HttpException('Failed to send friend request.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getFriendRequests(request: GetFriendRequestsDto, page: number = 1, limit: number = 10) {
    page = Math.max(1, page);
    limit = Math.max(1, limit);

    try {
      const [friendRequests, total] = await this.friendsRepository.findAndCount({
        where: { receiver_id: request.recieverId },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        data: friendRequests,
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch {
      throw new HttpException('Failed to fetch friend requests.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}