import { Entity, ManyToOne, JoinColumn, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('FRIENDS')
export class Friend {
  @PrimaryGeneratedColumn()
  id: number

  @PrimaryColumn()
  person1_user_id: number;

  @PrimaryColumn()
  person2_user_id: number;

  @ManyToOne(() => User, (user) => user.friends1)
  @JoinColumn({ name: 'person1_user_id' })
  person1User: User;

  @ManyToOne(() => User, (user) => user.friends2)
  @JoinColumn({ name: 'person2_user_id' })
  person2User: User;
}