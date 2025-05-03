import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { InviteService } from './invite.service';
import { Socket } from 'socket.io';

@WebSocketGateway()
export class InviteGateway {
  constructor(private readonly inviteService: InviteService) {}

  @SubscribeMessage('send_invite')
  handleInvite(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    console.log(`Client ${client.id} joined game with data:`, data);
  }
}
