import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChatMessageDto } from './dto/create-chat_message.dto';
import { ChatMessage } from './chat_message.entity';
import { findChatMessageDto } from './dto/find.dto';
import { ChatRoom } from '../chat_rooms/chat_room.entity';
import { ChatParticipant } from '../chat_participants/chat_participant.entity';

@Injectable()
export class ChatMessagesService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessagesRepository: Repository<ChatMessage>,
    @InjectRepository(ChatRoom)
    private readonly chatRoomRepository: Repository<ChatRoom>,
    @InjectRepository(ChatParticipant)
    private readonly chatParticipantRepository: Repository<ChatParticipant>,
  ) {}
  private readonly logger = new Logger(ChatMessagesService.name);

  async create(
    createChatMessageDto: CreateChatMessageDto,
    id: number,
  ): Promise<ChatMessage> {
    const chatParticipant = await this.chatParticipantRepository.findOne({
      where: {
        user_id: id,
        chat_room_id: createChatMessageDto.chat_room_id,
        is_banned: false,
        is_muted: false,
      },
    });
    if (!chatParticipant) {
      throw new HttpException('ChatRoom Not Found', 404);
    }

    return this.chatMessagesRepository.save({
      ...createChatMessageDto,
      user_id: id,
    });
  }

  async find(
    findDto: findChatMessageDto & { currentUserId: number },
  ): Promise<ChatMessage[]> {
    const { chatRoomId, sent_time_from, sent_time_till } = findDto;
    const chatParticipant = await this.chatParticipantRepository.findOne({
      where: {
        user_id: findDto.currentUserId,
        chat_room_id: chatRoomId,
        is_banned: false,
      },
    });
    if (!chatParticipant) {
      throw new HttpException('ChatRoom Not Found', 404);
    }
    const queryBuilder =
      this.chatMessagesRepository.createQueryBuilder('chat_message');
    if (chatRoomId) {
      queryBuilder.where('chat_message.chat_room_id = :chatRoomId', {
        chatRoomId,
      });
    }
    if (sent_time_from && sent_time_till) {
      queryBuilder.andWhere('chat_message.sent_time BETWEEN :from AND :to', {
        from: sent_time_from,
        to: sent_time_till,
      });
    }
    return queryBuilder.getMany();
  }

  async findAll(): Promise<ChatMessage[]> {
    return await this.chatMessagesRepository.find();
  }

  async findByUserId(userId: number) {
    return this.chatMessagesRepository.find({
      where: { user_id: userId },
    });
  }

  async findByChatRoomId(id: number): Promise<ChatMessage[]> {
    const chatRoomData = await this.chatMessagesRepository.find({
      where: { chatRoom: { id } },
    });
    if (!chatRoomData) throw new HttpException('ChatMessage Not Found', 404);
    return chatRoomData;
  }

  async findByUserIdAndChatRoomId(userId: number, chatRoomId: number) {
    return this.chatMessagesRepository.find({
      where: {
        user_id: userId,
        chat_room_id: chatRoomId,
      },
    });
  }

  // async findAllAndSortByTime(): Promise<ChatMessage[]> {
  //   // Fetch messages from the repository
  //   const messages = await this.chatMessagesRepository.find();
  //   this.logger.log('Fetched messages Sent_time:', messages);

  //   // Filter and sort messages by sent_time in descending order
  //   const sortedMessages = messages
  //       .filter(message => {
  //           const date = new Date(message.sent_time);
  //           if (isNaN(date.getTime())) {
  //               // Log the invalid date and filter it out
  //               console.error("Invalid sent_time detected:", message.sent_time);
  //               return false; // Exclude this message
  //           }
  //           return true; // Include valid messages
  //       })
  //       .sort((a, b) => {
  //           const dateA = new Date(a.sent_time);
  //           const dateB = new Date(b.sent_time);
  //           // Return difference for descending order
  //           return dateB.getTime() - dateA.getTime();
  //       });

  //   return sortedMessages;
  // }

  async findAllAndSortByTime(): Promise<ChatMessage[]> {
    // Fetch messages from the repository
    const messages = await this.chatMessagesRepository.find();
    this.logger.log('Fetched messages Sent_time:', messages);

    // Filter and sort messages by sent_time in ascending order
    const sortedMessages = messages
      .filter((message) => {
        const date = new Date(message.sent_time);
        if (isNaN(date.getTime())) {
          // Log the invalid date and filter it out
          console.error('Invalid sent_time detected:', message.sent_time);
          return false; // Exclude this message
        }
        return true; // Include valid messages
      })
      .sort((a, b) => {
        const dateA = new Date(a.sent_time);
        const dateB = new Date(b.sent_time);
        // Return difference for ascending order
        return dateA.getTime() - dateB.getTime();
      });

    return sortedMessages;
  }

  async remove(chat_room_id: number): Promise<ChatMessage[]> {
    const existingChatMessage = await this.findByChatRoomId(chat_room_id);
    return await this.chatMessagesRepository.remove(existingChatMessage);
  }
}
