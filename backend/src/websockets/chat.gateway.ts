import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import {
  AuthenticatedSocket,
  JwtAccessAuthGuard,
} from '../auth/guards/jwt-access.guard';
import { ChatRoomsService } from '../chat_rooms/chat_rooms.service';
import { Server } from 'socket.io';
import { ChatMessage } from '../chat_messages/chat_message.entity';

@UseGuards(JwtAccessAuthGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'FETCH'],
  },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  constructor(
    private readonly jwtService: JwtService,
    private readonly chatRoomsService: ChatRoomsService,
  ) {}

  async handleConnection(
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    try {
      const token = client.handshake.auth.token;
      const roomId = client.handshake?.auth?.roomId;
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      // Attach the decoded token to the socket
      client.data.user = decoded;
      client.user = { ...decoded, id: decoded.sub }; // Ensure client.user is available

      if (!roomId) {
        console.error('No roomId was given');
        return;
      }
      const room = await this.chatRoomsService.findOne(roomId);
      client.join(room.wsRoomId);
      client.data.roomId = room.wsRoomId;

      const participant = room.chatParticipants.find(
        (p) => p.user_id === client.user.id,
      );

      this.server.to(room.wsRoomId).emit('joined', {
        participant,
        joined_at: new Date(),
      });

      if (!room) {
        console.error('No room was found');
        return;
      }
    } catch (error) {
      console.error('Error during token verification on connection:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    const user = client.data?.user;
    if (!user || !user.sub) {
      console.warn(`User info missing on disconnect for socket ${client.id}`);
      return;
    }
    const roomId = client.data?.roomId;
    if (!roomId) {
      console.warn(`Room ID missing on disconnect for socket ${client.id}`);
      return;
    }
    const room = await this.chatRoomsService.findOneByWsRoomId(roomId);
    const participant = room.chatParticipants.find(
      (p) => p.user_id === user.sub,
    );
    if (participant)
      this.server.to(roomId).emit('left', {
        participant,
        left_at: new Date(),
      });
    client.leave(roomId);
    client.disconnect();
    // console.log(`User ${user.sub} disconnected from room ${roomId}`);
  }

  @SubscribeMessage('message')
  async handleMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: ChatMessage,
  ): Promise<void> {
    const roomId: string | undefined = client.data?.roomId;
    if (!roomId || !data) {
      console.error('Room ID or message is missing');
      return;
    }

    this.server.to(roomId).emit('message', data);
  }
}
