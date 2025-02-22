import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  AuthenticatedSocket,
  JwtAccessAuthGuard,
} from '../auth/guards/jwt-access.guard';

@UseGuards(JwtAccessAuthGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'FETCH'],
  },
  namespace: 'users',
})
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: AuthenticatedSocket) {
    console.log(`Client connected: ${client.id}`);
    // The UnifiedJwtAuthGuard attaches the user to the client after authentication.
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Here you can mark the user as offline in your system.
  }

  @SubscribeMessage('heartbeat')
  handleHeartbeat(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): void {
    console.log(`Heartbeat received from ${client.id}`, data);
    console.log(`Authenticated user: ${client.user?.id}`);
    // Update user's last active timestamp or perform other presence tracking logic.
  }
}
