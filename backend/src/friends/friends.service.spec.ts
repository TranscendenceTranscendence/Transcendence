import { Test, TestingModule } from '@nestjs/testing';
import { FriendsService } from './friends.service';
import { Repository } from 'typeorm';
import { Friend, FriendStatus } from './friend.entity';
import { User, UserStatus } from '../users/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException } from '@nestjs/common';

describe('FriendsService', () => {
  let service: FriendsService;
  let friendsRepository: Repository<Friend>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendsService,
        {
          provide: getRepositoryToken(Friend),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<FriendsService>(FriendsService);
    friendsRepository = module.get<Repository<Friend>>(
      getRepositoryToken(Friend),
    );
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('getFriendRequests', () => {
    it('should return paginated friend requests successfully', async () => {
      const mockSender: User = {
        id: 1,
        avatar: '',
        nickname: 'John',
        enable_two_factor: false,
        is_second_auth_done: false,
        second_auth_code: null,
        email: 'john@example.com',
        ladder_level: 0,
        user_status: UserStatus.Online,
        achievements: [],
        blockedUsers: [],
        users: [],
        chatMessages: [],
        chatParticipants: [],
        sentFriendRequests: [],
        receivedFriendRequests: [],
        players1: [],
        players2: [],
        winners: [],
      };

      const mockReceiver: User = {
        id: 2,
        avatar: '',
        nickname: 'Doe',
        enable_two_factor: false,
        is_second_auth_done: false,
        second_auth_code: null,
        email: 'doe@example.com',
        ladder_level: 0,
        user_status: UserStatus.Online,
        achievements: [],
        blockedUsers: [],
        users: [],
        chatMessages: [],
        chatParticipants: [],
        sentFriendRequests: [],
        receivedFriendRequests: [],
        players1: [],
        players2: [],
        winners: [],
      };

      const mockFriendRequests: Friend[] = [
        {
          id: 1,
          sender_id: mockSender.id,
          receiver_id: mockReceiver.id,
          status: FriendStatus.PENDING,
          created_at: new Date(),
          sender: mockSender,
          receiver: mockReceiver,
        },
      ];

      const mockTotal = 1;

      jest
        .spyOn(friendsRepository, 'findAndCount')
        .mockResolvedValueOnce([mockFriendRequests, mockTotal]);

      const result = await service.getFriendRequests({ recieverId: 2 }, 1, 10);

      expect(result).toEqual({
        data: mockFriendRequests,
        total: mockTotal,
        page: 1,
        pageSize: 10,
        totalPages: 1,
      });
    });

    it('should handle repository errors gracefully', async () => {
      jest
        .spyOn(friendsRepository, 'findAndCount')
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(
        service.getFriendRequests({ recieverId: 2 }, 1, 10),
      ).rejects.toThrow(HttpException);
    });

    it('should return no data if there are no friend requests', async () => {
      jest
        .spyOn(friendsRepository, 'findAndCount')
        .mockResolvedValueOnce([[], 0]);

      const result = await service.getFriendRequests({ recieverId: 2 }, 1, 10);

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      });
    });
  });
});
