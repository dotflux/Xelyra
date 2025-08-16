import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BotsGateway } from './bots.gateway';

@WebSocketGateway({
  namespace: '/bots-interactions',
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
})
export class BotsInteractionsGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;
  static server: Server;

  afterInit(server: Server) {
    BotsInteractionsGateway.server = server;
  }

  @SubscribeMessage('joinBotInteraction')
  handleJoinBotInteraction(
    @MessageBody() appId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    socket.join(`app:${appId}`);
  }

  @SubscribeMessage('buttonInteraction')
  handleButtonInteraction(
    @MessageBody()
    interaction: {
      appId: string;
      botId: string;
      command: string;
      channelId: string;
      userId: string;
      customId: string;
      messageId: string;
    },
    @ConnectedSocket() socket: Socket,
  ) {
    console.log(
      'interaction recieved (in interaction gateway)',
      interaction.appId,
    );
    BotsGateway.server
      .to(`app:${interaction.appId}`)
      .emit('buttonClicked', interaction);
  }
}
