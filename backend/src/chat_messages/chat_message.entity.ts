import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { ChatRoom } from '../chat_rooms/chat_room.entity';

@Entity('chat_message')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: false })
  content: string;

  @CreateDateColumn({ type: 'timestamp with time zone', nullable: true })
  sent_time: Date;

  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  chat_room_id: number;

  @ManyToOne(() => User, (user) => user.chatMessages)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chatMessages)
  @JoinColumn({ name: 'chat_room_id' })
  chatRoom: ChatRoom;
}
