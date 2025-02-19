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
    default: 'guest',
  })
  chat_participant_role: chat_participant_roles;

  @Column({ default: false })
  is_banned: boolean;

  @Column({ default: false })
  is_muted: boolean;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  entrance_time: Date;

  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  chat_room_id: number;

  @ManyToOne(() => User, (user) => user.chatParticipants)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ChatRoom, (chatRoom) => chatRoom.chatParticipants)
  @JoinColumn({ name: 'chat_room_id' })
  chatRoom: ChatRoom;
}
