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

  @SubscribeMessage('groupPanel')
  handleGroupPanel(
    @MessageBody() conversationId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(conversationId);
  }

  emitMemberChange(conversationId: string) {
    this.server.to(conversationId).emit('memberChange', {
      conversationId,
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
    buttons?: any[] | null,
  ) {
    this.server.to(channelId).emit('commandEdited', {
      messageId,
      message: newText,
      edited,
      embeds: embeds ?? null,
      buttons: buttons ?? null,
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

  // WebRTC Signaling Events
  @SubscribeMessage('callUser')
  handleCallUser(
    @MessageBody()
    data: { targetUserId: string; callerId: string; conversationId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(`User ${data.callerId} is calling user ${data.targetUserId}`);
    this.server.to(data.targetUserId).emit('incomingCall', {
      callerId: data.callerId,
      conversationId: data.conversationId,
    });
  }

  @SubscribeMessage('callAccepted')
  handleCallAccepted(
    @MessageBody() data: { targetUserId: string; accepterId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(
      `User ${data.accepterId} accepted call from ${data.targetUserId}`,
    );
    this.server.to(data.targetUserId).emit('callAccepted', {
      accepterId: data.accepterId,
    });
  }

  @SubscribeMessage('callRejected')
  handleCallRejected(
    @MessageBody() data: { targetUserId: string; rejecterId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(
      `User ${data.rejecterId} rejected call from ${data.targetUserId}`,
    );
    this.server.to(data.targetUserId).emit('callRejected', {
      rejecterId: data.rejecterId,
    });
  }

  @SubscribeMessage('iceCandidate')
  handleIceCandidate(
    @MessageBody() data: { targetUserId: string; candidate: any },
    @ConnectedSocket() socket: Socket,
  ) {
    this.server.to(data.targetUserId).emit('iceCandidate', {
      candidate: data.candidate,
    });
  }

  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody() data: { targetUserId: string; offer: any },
    @ConnectedSocket() socket: Socket,
  ) {
    this.server.to(data.targetUserId).emit('offer', {
      offer: data.offer,
    });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody() data: { targetUserId: string; answer: any },
    @ConnectedSocket() socket: Socket,
  ) {
    this.server.to(data.targetUserId).emit('answer', {
      answer: data.answer,
    });
  }

  @SubscribeMessage('endCall')
  handleEndCall(
    @MessageBody() data: { targetUserId: string; enderId: string },
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(`User ${data.enderId} ended call with ${data.targetUserId}`);
    this.server.to(data.targetUserId).emit('callEnded', {
      enderId: data.enderId,
    });
  }
}
