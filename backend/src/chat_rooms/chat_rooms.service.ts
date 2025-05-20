import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateChatRoomDto } from './dto/create-chat_room.dto';
import { UpdateChatRoomDto } from './dto/update-chat_room.dto';
import { ChatRoom } from './chat_room.entity';
import { ChatParticipant } from '../chat_participants/chat_participant.entity';
import { chat_room_types } from './chat_room.entity';
import { chat_participant_roles } from '../chat_participants/chat_participant.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChatRoomsService {
  constructor(
    @InjectRepository(ChatRoom)
    private readonly chatRoomsRepository: Repository<ChatRoom>,
    @InjectRepository(ChatParticipant)
    private readonly chatParticipantsRepository: Repository<ChatParticipant>,
  ) {}

  async create(createChatRoomDto: CreateChatRoomDto): Promise<ChatRoom> {
    const { title, password, chat_room_type, user_id } = createChatRoomDto;
    const saltRounds = 10;
    let hashedPassword: string;
    if (password && chat_room_type === chat_room_types.Protected) {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } else hashedPassword = '';
    const chatRoomData = await this.chatRoomsRepository.create({
      title,
      chat_room_type,
      password: hashedPassword,
    });
    const savedChatRoom = await this.chatRoomsRepository.save(chatRoomData);
    let creatorRole = chat_participant_roles.Owner;
    if (chat_room_type === chat_room_types.Dm)
      creatorRole = chat_participant_roles.Guest;
    const participant = this.chatParticipantsRepository.create({
      user_id: user_id,
      chat_room_id: savedChatRoom.id,
      chat_participant_role: creatorRole,
    });

    if (savedChatRoom.chat_room_type === chat_room_types.Dm) {
      const invitedParticipant = this.chatParticipantsRepository.create({
        user_id: createChatRoomDto.invited_user_id,
        chat_room_id: savedChatRoom.id,
        chat_participant_role: chat_participant_roles.Guest,
      });
      await this.chatParticipantsRepository.save(invitedParticipant);
    }

    await this.chatParticipantsRepository.save(participant);
    const value = await this.chatRoomsRepository.findOne({
      where: { id: savedChatRoom.id },
      relations: ['chatParticipants', 'chatParticipants.user'],
    });
    return value;
  }

  async findAll(): Promise<ChatRoom[]> {
    return await this.chatRoomsRepository.find({
      relations: ['chatParticipants', 'chatParticipants.user'],
    });
  }

  async findAllChatRoomList(id: number): Promise<ChatRoom[]> {
    return await this.chatRoomsRepository.find({
      relations: ['chatParticipants', 'chatParticipants.user'],
      where: [
        {
          chat_room_type: In(['public', 'protected']),
        },
        {
          chat_room_type: chat_room_types.Private,
          chatParticipants: {
            user_id: id,
          },
        },
        {
          chat_room_type: chat_room_types.Dm,
          chatParticipants: {
            user_id: id,
          },
        },
      ],
    });
  }

  async findAllPrivateChatRoomList(id: number): Promise<ChatRoom[]> {
    return await this.chatRoomsRepository.find({
      relations: ['chatParticipants', 'chatParticipants.user'],
      where: {
        chat_room_type: chat_room_types.Private,
        chatParticipants: {
          user_id: id,
          chat_participant_role: chat_participant_roles.Owner,
        },
      },
    });
  }

  async findAllWithoutPrivate(): Promise<ChatRoom[]> {
    return await this.chatRoomsRepository.find({
      where: {
        chat_room_type: In(['public', 'protected']),
      },
    });
  }

  async findOverview(userId: number): Promise<ChatRoom[]> {
    return await this.chatRoomsRepository.find({
      where: [
        {
          chat_room_type: In(['public', 'protected']), // chat_room_type: In(['public', 'protected']),
        },
        {
          chat_room_type: chat_room_types.Private,
          chatParticipants: { user_id: userId }, // chatParticipants: { user: { id: userId } },
        },
      ],
    });
  }

  async findOne(id: number): Promise<ChatRoom> {
    const chatRoomData = await this.chatRoomsRepository.findOne({
      where: { id },
      relations: ['chatParticipants', 'chatParticipants.user'],
    });
    if (!chatRoomData) throw new HttpException('ChatRoom Not Found', 404);
    return chatRoomData;
  }

  async findOneByWsRoomId(wsRoomId: string): Promise<ChatRoom> {
    const chatRoomData = await this.chatRoomsRepository.findOne({
      where: { wsRoomId },
      relations: ['chatParticipants', 'chatParticipants.user'],
    });
    if (!chatRoomData) throw new HttpException('ChatRoom Not Found', 404);
    return chatRoomData;
  }

  async findOneShallow(id: number): Promise<ChatRoom> {
    const chatRoomData = await this.chatRoomsRepository.findOne({
      where: { id },
      relations: ['chatParticipants'],
    });
    if (!chatRoomData) throw new HttpException('ChatRoom Not Found', 404);
    return chatRoomData;
  }

  async update(
    id: number,
    UpdateChatRoomDto: UpdateChatRoomDto,
  ): Promise<ChatRoom> {
    const existingChatRoom = await this.findOne(id);
    const chatRoomData = this.chatRoomsRepository.merge(
      existingChatRoom,
      UpdateChatRoomDto,
    );
    return await this.chatRoomsRepository.save(chatRoomData);
  }

  async checkPassword(chatRoomId: number, password: string): Promise<number> {
    const chatRoom: ChatRoom = await this.findOneShallow(+chatRoomId);

    if (!password || !chatRoom.password) {
      throw new HttpException('Password is required', 400);
    }
    const isMatch = await bcrypt.compare(password, chatRoom.password);

    if (isMatch) {
      return 1;
    } else {
      return 0;
    }
  }

  async editPassword(
    chatRoomId: number,
    UpdateChatRoomDto: UpdateChatRoomDto,
  ): Promise<ChatRoom> {
    const existingChatRoom = await this.findOneShallow(+chatRoomId);

    if (
      existingChatRoom.chat_room_type === chat_room_types.Protected &&
      existingChatRoom.password !== '' &&
      UpdateChatRoomDto.password === ''
    ) {
      UpdateChatRoomDto.chat_room_type = chat_room_types.Public;
    } else if (
      existingChatRoom.chat_room_type !== chat_room_types.Protected &&
      existingChatRoom.password === '' &&
      UpdateChatRoomDto.password !== ''
    ) {
      UpdateChatRoomDto.chat_room_type = chat_room_types.Protected;
    }
    const saltRounds = 10;

    if (UpdateChatRoomDto.password) {
      UpdateChatRoomDto.password = await bcrypt.hash(
        UpdateChatRoomDto.password,
        saltRounds,
      );
    }

    const chatRoomData = this.chatRoomsRepository.merge(
      existingChatRoom,
      UpdateChatRoomDto,
    );
    return await this.chatRoomsRepository.save(chatRoomData);
  }

  async remove(id: number): Promise<ChatRoom> {
    const existingChatRoom = await this.findOne(id);
    await this.chatRoomsRepository.remove(existingChatRoom);
    return;
  }
}
