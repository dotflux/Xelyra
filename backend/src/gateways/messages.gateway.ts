import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

// i was too lazy to make a new event for this so i just used the same event for others aside messages too!

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

  @SubscribeMessage('convUpdate')
  handleConvUpdate(
    @MessageBody() conversationId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(conversationId);
  }

  emitConvUpdate(conversationId: string, lastCreatedTimestamp: Date) {
    this.server.to(conversationId).emit('orderUpdated', {
      conversationId,
      lastCreatedTimestamp,
    });
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

  emitCommandEdit(
    channelId: string,
    messageId: string,
    newText: string,
    edited: boolean,
    embeds?: any[] | null,
  ) {
    this.server.to(channelId).emit('commandEdited', {
      messageId,
      message: newText,
      edited,
      embeds: embeds ?? null,
    });
  }

  emitMessageDelete(channelId: string, messageId: string) {
    this.server.to(channelId).emit('messageDeleted', {
      channelId,
      messageId,
    });
  }

  emitCommandDelete(channelId: string, messageId: string) {
    this.server.to(channelId).emit('commandDeleted', {
      channelId,
      messageId,
    });
  }

  @SubscribeMessage('joinUser')
  handleJoinUser(
    @MessageBody() userId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(userId);
    console.log(`Socket ${socket.id} joined user room ${userId}`);
  }

  emitUserUpdate(userId: string, userData: any) {
    this.server.to(userId.toString()).emit('userUpdated', {
      userId,
      userData,
    });
  }

  emitAppCreated(userId: string) {
    this.server.to(userId.toString()).emit('appCreated', {
      userId,
    });
    console.log('app created called');
  }
}
