import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ChatMessage } from '../chat_messages/chat_message.entity';
import { ChatParticipant } from '../chat_participants/chat_participant.entity';

export enum chat_room_types {
  Public = 'public',
  Protected = 'protected',
  Private = 'private',
  Dm = 'Dm',
}

@Entity('chat_room')
export class ChatRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column()
  password: string;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  creation_date: Date;

  @Column({
    type: 'enum',
    enum: chat_room_types,
    default: 'public',
  })
  chat_room_type: chat_room_types;

  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chatRoom)
  chatMessages?: ChatMessage[];

  @OneToMany(
    () => ChatParticipant,
    (chatParticipant) => chatParticipant.chatRoom,
  )
  chatParticipants?: ChatParticipant[];
}
