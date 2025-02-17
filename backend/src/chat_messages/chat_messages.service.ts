import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateChatMessageDto } from './dto/create-chat_message.dto';
import { ChatMessage } from './chat_message.entity';

@Injectable()
export class ChatMessagesService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessagesRepository: Repository<ChatMessage>,
  ) {}
  private readonly logger = new Logger(ChatMessagesService.name);
  async create(
    createChatMessageDto: CreateChatMessageDto,
  ): Promise<ChatMessage> {
    const chatMessageData =
      await this.chatMessagesRepository.create(createChatMessageDto);
    return this.chatMessagesRepository.save(chatMessageData);
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
