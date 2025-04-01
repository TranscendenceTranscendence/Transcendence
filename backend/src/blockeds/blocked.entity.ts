import { Entity, ManyToOne, JoinColumn, Column, PrimaryColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('blocked')
export class Blocked {
  @Column({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  blocked_time: Date;

  @PrimaryColumn()
  blockedUser: User;
}
