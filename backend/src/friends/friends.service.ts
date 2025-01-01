import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { Friend } from './friend.entity';
import { ApiProperty } from '@nestjs/swagger';

class SendFriendRequestDto {
  @ApiProperty()
  senderId: number

  @ApiProperty()
  sendeeId: number

}

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendsRepository: Repository<Friend>,
  ) {}

  async sendFriendRequest(
    request: SendFriendRequestDto
  ) {
    const sendee = await this.friendsRepository.findOneBy(
      {id: request.sendeeId}
    )
  }

  async create(
    createFriendDto: CreateFriendDto,): Promise<Friend> {
        const friendData =
            await this.friendsRepository.create(
                createFriendDto,
            );
    return this.friendsRepository.save(friendData);
  }

  async findAll(): Promise<Friend[]> {
    return await this.friendsRepository.find();
  }

  async findByPersonUserId(id: number): Promise<Friend[]> {
    const friendData =
        await this.friendsRepository.find({ 
          where: [
            { person1User: { id }},
            { person2User: { id }}
          ]
        });
    if (!friendData)
        throw new HttpException(
            'Friend Not Found',
            404,
        );
        return friendData;
  }

  // async update(
  //   id: number,
  //   UpdateFriendDto: UpdateFriendDto,): Promise<Friend[]> {
  //   const existingFriend = await this.findByPersonUserId(id);
  //   const friendData = this.friendsRepository.merge(
  //       existingFriend,
  //       UpdateFriendDto,
  //   );
  //   return await this.friendsRepository.save(
  //       friendData,
  //   );
  // }

  async remove(id: number): Promise<Friend[]> {
    const existingFriend = await this.findByPersonUserId(id);
    return await this.friendsRepository.remove(existingFriend,);
  }
}