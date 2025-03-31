import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'FETCH'],
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  handleConnection(client: any) {
    void client;
    // console.log('Client connected:', client.id);
  }

  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    void body;
    // console.log(body);
  }

  handleDisconnect(client: any) {
    void client;
    // console.log('Client disconnected:', client.id);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(client: any, payload: { message: string; user_id: number }) {
    this.server.emit('receiveMessage', payload);
  }
}
