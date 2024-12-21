import {Entity, Column, OneToMany, PrimaryColumn} from 'typeorm';
import { Achievement } from '../achievements/achievement.entity';
import { ChatMessage } from '../chat_messages/chat_message.entity';
import { Friend } from '../friends/friend.entity';
import { Blocked } from '../blockeds/blocked.entity';
import { Game } from '../games/game.entity';
import { ChatParticipant } from '../chat_participants/chat_participant.entity';
import { IsOptional } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export enum user_status {
	Offline = "offline",
	Online = "online",
	Waiting = "waiting",
	Playing = "playing"
}

@Entity('USER')
export class User {
  @ApiProperty({ type: 'number', description: 'The ID of the user.' })
  @PrimaryColumn()
  id: number;

  @ApiProperty({ type: Buffer, description: 'The avatar of the user.' })
  @Column({ type: "bytea", nullable: false })
  @IsOptional()
  avatar: Buffer;

  @ApiProperty({ type: 'string', description: 'The nickname of the user.' })
  @Column({ nullable: true })
  nickname: string;

  @ApiProperty({ type: 'boolean', description: 'The two factor authentication status of the user.' })
  @Column({ default: false })
  enable_two_factor: boolean;

  @ApiProperty({ type: 'boolean', description: 'The two factor authentication status of the user.' })
  @Column({ default: false })
  is_second_auth_done: boolean;

  @ApiProperty({ type: 'number', description: 'The two factor authentication status of the user.' })
  @Column({ type: "smallint", nullable: true })
  second_auth_code: number;

  @ApiProperty({ type: 'string', description: 'The email of the user.' })
  @Column({ nullable: false, })
  email: string;

  @ApiProperty({ type: 'number', description: 'The ladder level of the user.' })
  @Column({
			type: "int",
			nullable: false,
			default: 0 
	})
  @IsOptional()
  ladder_level: number;

  @ApiProperty({ type: 'string', description: 'The status of the user.' })
  @Column({
	type: "enum",
	enum: user_status,
	default: 'offline',
  })
  @IsOptional()
  user_status: user_status;

  // Relationships
  @OneToMany(() => Achievement, achievement => achievement.user,)
  achievements: Achievement[];

  @OneToMany(() => Blocked, blocked => blocked.user)
  blockedUsers: Blocked[];

  @OneToMany(() => Blocked, blocked => blocked.blockedUser)
  users: Blocked[];

  @OneToMany(() => ChatMessage, message => message.user)
  chatMessages: ChatMessage[];

  @OneToMany(() => ChatParticipant, participant => participant.user)
  chatParticipants: ChatParticipant[];

  @OneToMany(() => Friend, friend => friend.person1User)
  friends1: Friend[];

  @OneToMany(() => Friend, friend => friend.person2User)
  friends2: Friend[];

  @OneToMany(() => Game, game => game.player1User)
  players1: Game[];

  @OneToMany(() => Game, game => game.player2User)
  players2: Game[];

  @OneToMany(() => Game, game => game.player2User)
  winners: Game[];
}
