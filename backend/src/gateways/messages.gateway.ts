import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: '/messages',
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class MessagesGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    // optional server setup
  }

  // client emits "joinConversation"
  @SubscribeMessage('joinConversation')
  handleJoin(
    @MessageBody() conversationId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(conversationId);
  }

  // utility to emit to a conversation room
  sendToConversation(conversationId: string, payload: any) {
    this.server.to(conversationId).emit('newMessage', payload);
  }

  emitMessageEdit(
    channelId: string,
    messageId: string,
    newText: string,
    edited: boolean,
  ) {
    this.server.to(channelId).emit('messageEdited', {
      messageId,
      message: newText,
      edited,
    });
  }

  emitMessageDelete(channelId: string, messageId: string) {
    this.server.to(channelId).emit('messageDeleted', {
      channelId,
      messageId,
    });
  }
}
