import {
  Entity,
  ManyToOne,
  JoinColumn,
  Column,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('blocked')
export class Blocked {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  blocked_time: Date;

  @ManyToOne(() => User, (user) => user.users, { eager: true })
  @JoinColumn()
  blockedUser: User;
}
