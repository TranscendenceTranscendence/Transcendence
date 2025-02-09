import { Entity, ManyToOne, JoinColumn, Column, PrimaryColumn} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('blocked')
export class Blocked {

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  blocked_time: Date;

  @PrimaryColumn()
  blocked_user_id: number;
  
  @PrimaryColumn()
  user_id: number;

  @ManyToOne(() => User, (user) => user.blockedUsers)
  @JoinColumn({ name: 'blocked_user_id' })
  blockedUser: User;

  @ManyToOne(() => User, (user) => user.users)
  @JoinColumn({ name: 'user_id' })
  user: User;
}