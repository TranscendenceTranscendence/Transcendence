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
import { Server } from 'socket.io';
import {
  AuthenticatedSocket,
  JwtAccessAuthGuard,
} from '../auth/guards/jwt-access.guard';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from './user.entity';

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

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  handleConnection(@ConnectedSocket() client: AuthenticatedSocket): void {
    try {
      const token = client.handshake.auth.token;
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      // Attach the decoded token to the socket
      client.data.user = decoded;
      client.user = { ...decoded, id: decoded.sub }; // Ensure client.user is available

      // emit the user's status to the client (online)
      this.server.to(`user_${client.user.id}`).emit('userStatus', {
        userId: client.user.id,
        status: UserStatus.Online,
      });

      // Mark the user as active upon connection
      this.usersService
        .setLastActive(client.user.id)
        .catch((err) =>
          console.error(
            `Error setting last active on connection for user ${client.user.id}:`,
            err,
          ),
        );

      console.log(`Client connected: ${client.id} (User: ${decoded.sub})`);
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
    console.log(`Disconnecting user ${user.sub} (Socket: ${client.id})`);
    this.server.to(`user_${user.sub}`).emit('userStatus', {
      userId: user.sub,
      status: UserStatus.Offline,
    });
    try {
      await this.usersService.setStatus(user.sub, UserStatus.Offline);
    } catch (error) {
      console.error(
        `Error setting status to offline for user ${user.sub}:`,
        error,
      );
    }
  }

  @SubscribeMessage('subscribeToUser')
  handleJoinRoom(
    @MessageBody() userId: number,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): void {
    const user = client.data?.user;
    const targetRoom = `user_${userId}`;
    if (!user || !user.sub) {
      console.warn(
        `Unauthenticated socket ${client.id} tried to join room ${targetRoom}`,
      );
      return;
    }
    client.join(targetRoom);
    console.log(`User ${user.sub} joined room ${targetRoom}`);
  }

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ): Promise<void> {
    const user = client.data?.user;
    if (!user || !user.sub) {
      console.warn(
        `Heartbeat received from unauthenticated socket ${client.id}`,
      );
      return;
    }
    console.log(`Heartbeat received from ${client.id}:`, data);
    try {
      await this.usersService.setLastActive(user.sub, new Date(data.timestamp));
    } catch (error) {
      console.error(`Error updating last active for user ${user.sub}:`, error);
    }
  }
}
