import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friend, FriendStatus } from './friend.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../users/user.entity';

class SendFriendRequestDto {
  @ApiProperty()
  senderId: number;

  @ApiProperty()
  receiverId: number;
}

class GetFriendRequestsDto {
  @ApiProperty()
  receiverId: number;
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
    try {
      const { senderId, receiverId } = request;

      // Check if receiver exists
      const receiver = await this.usersRepository.findOne({
        where: { id: receiverId },
      });

      if (!receiver) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Check existing request
      const existingRequest = await this.friendsRepository.findOne({
        where: [
          { sender_id: senderId, receiver_id: receiverId },
          { sender_id: receiverId, receiver_id: senderId },
        ],
      });

      if (existingRequest) {
        throw new HttpException(
          'Friend request already exists',
          HttpStatus.CONFLICT,
        );
      }

      const newFriendRequest = this.friendsRepository.create({
        sender_id: senderId,
        receiver_id: receiverId,
        status: FriendStatus.PENDING,
      });

      await this.friendsRepository.save(newFriendRequest);
      return { message: 'Friend request sent successfully' };
    } catch (error) {
      console.error('Error in sendFriendRequest:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to send friend request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFriends(userId: number, page = 1, limit = 10) {
    // Ensure page and limit are positive integers
    page = Math.max(1, page);
    limit = Math.max(1, limit);

    // Fetch friends with pagination
    const [friends, totalFriends] = await this.friendsRepository.findAndCount({
      where: [
        { sender_id: userId, status: FriendStatus.ACCEPTED },
        { receiver_id: userId, status: FriendStatus.ACCEPTED },
      ],
      relations: ['sender', 'receiver'],
      take: limit,
      skip: (page - 1) * limit,
    });

    return {
      data: friends,
      total: totalFriends,
      page,
      pageSize: limit,
      totalPages: Math.ceil(totalFriends / limit),
    };
  }

  async getFriendRequests(request: GetFriendRequestsDto, page = 1, limit = 10) {
    const { receiverId } = request;

    // Ensure page and limit are positive integers
    page = Math.max(1, page);
    limit = Math.max(1, limit);

    try {
      // Fetch friend requests with pagination
      const friendRequests = await this.friendsRepository.find({
        where: { receiver_id: receiverId },
        relations: ['sender'],
        take: limit,
        skip: (page - 1) * limit,
      });

      return {
        data: friendRequests,
        total: friendRequests.length,
        page,
        pageSize: limit,
        totalPages: Math.ceil(10 / limit),
      };
    } catch {
      throw new HttpException(
        'Failed to fetch friend requests.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
