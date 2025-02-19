import { Test, TestingModule } from '@nestjs/testing';
import { FriendsController } from './friends.controller';
import { FriendsService } from './friends.service';
import { JwtAccessAuthGuard } from 'auth/guards/jwt-access.guard';
import { Request } from 'express';

describe('FriendsController', () => {
  let controller: FriendsController;

  const mockFriendsService = {
    sendFriendRequest: jest.fn(),
    getFriendRequests: jest.fn(),
  };

  const mockJwtAccessAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendsController],
      providers: [
        {
          provide: FriendsService,
          useValue: mockFriendsService,
        },
      ],
    })
      .overrideGuard(JwtAccessAuthGuard)
      .useValue(mockJwtAccessAuthGuard)
      .compile();

    controller = module.get<FriendsController>(FriendsController);
    friendsService = module.get<FriendsService>(FriendsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendFriendRequest', () => {
    it('should send a friend request successfully', async () => {
      const req = { user: { id: 1 } } as Request;
      const recieverId = 2;

      mockFriendsService.sendFriendRequest.mockResolvedValueOnce(undefined);

      const result = await controller.sendFriendRequest(recieverId, req);

      expect(mockFriendsService.sendFriendRequest).toHaveBeenCalledWith({
        recieverId,
        senderId: req.user.id,
      });
      expect(result).toEqual({
        success: true,
        message: 'Friend Request send Successfully',
      });
    });

    it('should handle errors during friend request', async () => {
      const req = { user: { id: 1 } } as Request;
      const recieverId = 2;

      mockFriendsService.sendFriendRequest.mockRejectedValueOnce(
        new Error('User not found'),
      );

      const result = await controller.sendFriendRequest(recieverId, req);

      expect(mockFriendsService.sendFriendRequest).toHaveBeenCalledWith({
        recieverId,
        senderId: req.user.id,
      });
      expect(result).toEqual({
        success: false,
        message: 'User not found',
      });
    });
  });

  describe('getFriendRequests', () => {
    it('should return friend requests successfully', async () => {
      const req = { user: { id: 1 } } as Request;
      const mockFriendRequests = [
        { id: 1, senderId: 2, recieverId: 1, status: 'pending' },
      ];

      mockFriendsService.getFriendRequests.mockResolvedValueOnce(
        mockFriendRequests,
      );

      const result = await controller.getFriendRequests(req);

      expect(mockFriendsService.getFriendRequests).toHaveBeenCalledWith({
        recieverId: req.user.id,
      });
      expect(result).toEqual(mockFriendRequests);
    });

    it('should handle errors during fetching friend requests', async () => {
      const req = { user: { id: 1 } } as Request;

      mockFriendsService.getFriendRequests.mockRejectedValueOnce(
        new Error('Database error'),
      );

      await expect(controller.getFriendRequests(req)).rejects.toThrow(
        'Database error',
      );
    });
  });
});
