import {
  Entity,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum FriendStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  NOT_FRIENDS = 'not_friends',
}

@Entity('friends')
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sender_id: number;

  @Column()
  receiver_id: number;

  @Column({ type: 'enum', enum: FriendStatus, default: FriendStatus.PENDING })
  status: FriendStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'receiver_id' })
  receiver: User;
}
