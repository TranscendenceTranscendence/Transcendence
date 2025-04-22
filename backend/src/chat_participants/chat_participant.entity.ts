import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { ChatRoom } from '../chat_rooms/chat_room.entity';

export enum chat_participant_roles {
  Owner = 'owner',
  Admin = 'admin',
  Guest = 'guest',
}

@Entity('chat_participant')
export class ChatParticipant {
  @Column({
    type: 'enum',
    enum: chat_participant_roles,
    default: chat_participant_roles.Guest,
  })
  chat_participant_role: chat_participant_roles;

  @Column({ default: new Date(0) })
  leftAt: Date;

  @Column({ default: false })
  is_banned: boolean;

  @Column({ default: new Date(0) })
  banned_until: Date;

  @Column({ default: false })
  is_muted: boolean;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  chat_room_id: number;

  @ManyToOne(() => User, (user) => user.chatParticipants)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chatParticipants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'chat_room_id' })
  chatRoom: ChatRoom;
}
