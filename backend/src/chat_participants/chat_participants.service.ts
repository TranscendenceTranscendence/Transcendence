import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChatParticipantDto } from './dto/create-chat_participant.dto';
import { UpdateChatParticipantDto } from './dto/update-chat_participant.dto';
import { ChatParticipant } from './chat_participant.entity';
import { User } from '../users/user.entity';
import { ChatRoom } from '../chat_rooms/chat_room.entity';

@Injectable()
export class ChatParticipantsService {
  constructor(
    @InjectRepository(ChatParticipant)
    private readonly chatParticipantsRepository: Repository<ChatParticipant>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(ChatRoom)
    private chatRoomRepository: Repository<ChatRoom>,
  ) {}

  async create(
    createChatParticipantDto: CreateChatParticipantDto,
  ): Promise<ChatParticipant> {
    const chatParticipantData = await this.chatParticipantsRepository.create(
      createChatParticipantDto,
    );
    return this.chatParticipantsRepository.save(chatParticipantData);
  }

  async findAll(): Promise<ChatParticipant[]> {
    return await this.chatParticipantsRepository.find();
  }

  async findByChatRoomId(id: number): Promise<ChatParticipant[]> {
    const chatRoomData = await this.chatParticipantsRepository.find({
      where: { chatRoom: { id } },
      relations: ['user', 'user.blockedUsers'],
      loadEagerRelations: true,
    });
    if (!chatRoomData)
      throw new HttpException('ChatParticipant Not Found', 404);
    return chatRoomData;
  }

  async findByUserId(userId: number): Promise<ChatParticipant> {
    const userData = await this.chatParticipantsRepository.findOne({
      where: { user: { id: userId } },
    });
    if (!userData) throw new HttpException('ChatParticipant Not Found', 404);
    return userData;
  }

  async findByUserIdAndChatRoom(
    chatRoomId: number,
    userId: number,
  ): Promise<ChatParticipant> {
    const participant = await this.chatParticipantsRepository.findOne({
      where: {
        user: { id: userId },
        chatRoom: { id: chatRoomId },
      },
      relations: ['user', 'chatRoom'],
    });

    if (!participant) {
      throw new HttpException('ChatParticipant Not Found', 404);
    }
    return participant;
  }

  // async findByUserId(chatRoomId: number, userId: number): Promise<ChatParticipant> {
  //   const participant = await this.chatParticipantsRepository.findOne({
  //       where: {
  //           user: { id: userId },
  //           chatRoom: { id: chatRoomId },
  //       },
  //       relations: ['user', 'chatRoom'],
  //   });

  //   if (!participant) {
  //       throw new HttpException('ChatParticipant Not Found', 404);
  //   }
  //   return participant;
  // }

  async update(
    chatRoomId: number,
    id: number,
    updateDto: UpdateChatParticipantDto,
  ): Promise<ChatParticipant> {
    const existingChatParticipant = await this.findByUserIdAndChatRoom(
      chatRoomId,
      id,
    );

    Object.assign(existingChatParticipant, updateDto);
    await this.chatParticipantsRepository.save(existingChatParticipant);

    return await this.chatParticipantsRepository.findOne({
      where: { user_id: existingChatParticipant.user_id },
    });
  }

  async remove(
    chat_room_id: number,
    user_id: number,
  ): Promise<ChatParticipant[]> {
    const existingChatParticipants = await this.chatParticipantsRepository.find(
      {
        where: { chat_room_id, user_id },
      },
    );
    return await this.chatParticipantsRepository.remove(
      existingChatParticipants,
    );
  }

  async addParticipantToChatRoom(chatRoomId: number, userId: number) {
    const chatRoom = await this.chatRoomRepository.findOne({
      where: { id: chatRoomId },
    });
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!chatRoom || !user) {
      throw new Error('Chat room or user not found');
    }

    const existingParticipant = await this.chatParticipantsRepository.findOne({
      where: {
        chatRoom: { id: chatRoomId },
        user: { id: userId },
      },
    });

    if (existingParticipant) {
      return { message: 'User is already a participant in the chat room' };
    }

    const newParticipant = this.chatParticipantsRepository.create({
      chatRoom: chatRoom,
      user: user,
    });

    await this.chatParticipantsRepository.save(newParticipant);

    return { message: 'User added as a participant to the chat room' };
  }
}
