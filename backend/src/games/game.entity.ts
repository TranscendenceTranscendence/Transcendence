import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';


export enum GameStatus {
  PENDING = 'pending',
  OPEN = 'open',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  room_identifier: string;

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.OPEN
  })
  status: GameStatus;

  @Column()
  player1: number;

  @Column({ nullable: true })
  player2: number;

  @Column('int', { array: true, default: [0, 0] })
  score: number[];

  @Column({ type: 'timestamp', nullable: true })
  ended_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
