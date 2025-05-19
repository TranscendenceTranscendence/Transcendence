import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum GameStatus {
  PENDING = 'pending',
  COUNTDOWN = 'countdown',
  ONGOING = 'ongoing',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
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
    default: GameStatus.PENDING,
  })
  status: GameStatus;

  @Column()
  player1_user_id: number;

  @Column({ nullable: true })
  player2_user_id: number;

  @Column({ nullable: true })
  winner_user_id: number;

  @Column('int', { array: true, default: [0, 0] })
  score: number[];

  @Column({ type: 'timestamp', nullable: true })
  ended_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ nullable: true, default: 0})
  invite_id: number;
}
