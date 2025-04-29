import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum InviteStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired',
}

@Entity('invite')
export class Invite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  senderUserId: number;

  @Column()
  receiverUserId: number;

  @Column({ default: InviteStatus.PENDING })
  status: InviteStatus;

  @Column({ nullable: true })
  gameRoomId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ nullable: true })
  expiresAt: Date;
}
