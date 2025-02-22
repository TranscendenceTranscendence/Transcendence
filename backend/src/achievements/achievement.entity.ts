import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';

export enum AchievementType {
  FIRST_LOGIN = 'FIRST_LOGIN',
  FIRST_PROFILE_UPDATE = 'FIRST_PROFILE_UPDATE',
}

@Entity('achievements')
export class Achievement {
  @PrimaryColumn()
  userId: number;

  @ManyToOne(() => User, (user) => user.achievements)
  @JoinColumn({ name: 'userId' })
  user: User;

  @PrimaryColumn({ type: 'enum', enum: AchievementType })
  type: AchievementType;
}
