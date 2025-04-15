import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { Achievement } from '../achievements/achievement.entity';
import { ChatMessage } from '../chat_messages/chat_message.entity';
import { Friend } from '../friends/friend.entity';
import { Game } from '../games/game.entity';
import { ChatParticipant } from '../chat_participants/chat_participant.entity';
import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserStatus {
  Offline = 'offline',
  Online = 'online',
  Waiting = 'waiting',
  Playing = 'playing',
}

@Entity('user')
export class User {
  @ApiProperty({ type: 'number', description: 'The ID of the user.' })
  @PrimaryColumn()
  id: number;

  @ApiProperty({ type: 'string', description: 'The url to avatar' })
  @Column({ default: '' })
  avatar: string;

  @ApiProperty({ type: 'string', description: 'The nickname of the user.' })
  @Column({ nullable: true })
  nickname: string;

  @ApiProperty({
    type: 'boolean',
    description: 'The two factor authentication status of the user.',
  })
  @Column({ default: false })
  two_factor_enabled: boolean;

  @ApiProperty({
    type: 'boolean',
    description: 'The two factor authentication status of the user.',
  })
  @Column({ default: false })
  is_second_auth_done: boolean;

  @ApiProperty({
    type: 'string',
    description: 'The two factor authentication secret of the user.',
  })
  @Column({ nullable: true })
  two_factor_auth_secret: string;

  @ApiProperty({ type: 'string', description: 'The email of the user.' })
  @Column({ nullable: false })
  email: string;

  @ApiProperty({ type: 'number', description: 'The ladder level of the user.' })
  @Column({
    type: 'int',
    nullable: false,
    default: 0,
  })
  @IsOptional()
  ladder_level: number;

  @ApiProperty({ type: 'string', description: 'The status of the user.' })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.Offline,
  })
  @IsOptional()
  user_status: UserStatus;

  @ApiProperty({
    type: 'date',
    description: 'The last active date of the user.',
  })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActive: Date;

  // Relationships
  @IsOptional()
  @OneToMany(() => Achievement, (achievement) => achievement.user)
  achievements?: Achievement[];

  // @IsOptional()
  // blockedUsers?: Blocked[];

  @IsOptional()
  @ApiProperty({ type: [Number], description: 'The IDs of blocked users.' })
  @Column('int', { array: true, default: [] })
  blockedUsers?: number[];

  @IsOptional()
  @OneToMany(() => ChatMessage, (message) => message.user)
  chatMessages?: ChatMessage[];

  @IsOptional()
  @OneToMany(() => ChatParticipant, (participant) => participant.user)
  chatParticipants?: ChatParticipant[];

  @IsOptional()
  @OneToMany(() => Friend, (friend) => friend.sender)
  sentFriendRequests?: Friend[];

  @IsOptional()
  @OneToMany(() => Friend, (friend) => friend.receiver)
  receivedFriendRequests?: Friend[];

  @IsOptional()
  @OneToMany(() => Game, (game) => game.player1_user_id)
  gamesAsPlayer1?: Game[];

  @IsOptional()
  @OneToMany(() => Game, (game) => game.player2_user_id)
  gamesAsPlayer2?: Game[];

  @IsOptional()
  @OneToMany(() => Game, (game) => game.winner_user_id)
  gamesWon?: Game[];

  // METHODS
}
