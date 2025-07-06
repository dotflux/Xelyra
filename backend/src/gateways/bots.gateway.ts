// src/gateways/bots.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { BotsService } from 'src/services/bots.service';
import { MessagesService } from 'src/services/messages.service';
import { MessagesGateway } from './messages.gateway';
import { SlashCommandsService } from 'src/services/slashCommands.service';
import { handleValidateCommandLogic } from './botGateway/handleValidateCommand';
import { handleSendMessageLogic } from './botGateway/handleSendMessage';
import { handleEditMessageLogic } from './botGateway/handleEditMessage';
import { handleRemoveMessageLogic } from './botGateway/handleRemoveMessage';

@WebSocketGateway({
  namespace: '/bot',
  cors: { origin: 'http://localhost:5173', credentials: true },
})
export class BotsGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private botsService: BotsService,
    private messagesService: MessagesService,
    private messagesGateway: MessagesGateway,
    private slashService: SlashCommandsService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;
    if (!token) return client.disconnect();

    const bot = await this.botsService.findByToken(token);
    if (bot.length === 0) return client.disconnect();

    client.data.botId = bot[0].bot_id;
    client.data.appId = bot[0].app_id;

    client.join(`app:${bot[0].app_id}`);

    console.log(`Bot connected: ${bot[0].bot_id}`);
  }

  @SubscribeMessage('validateCommand')
  async handleValidateCommand(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { command: string; options: any[]; description: string },
  ) {
    return handleValidateCommandLogic(
      client,
      payload,
      this.botsService,
      this.slashService,
    );
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      channelId: string;
      message: string;
      command: string;
      user: string;
    },
  ) {
    return handleSendMessageLogic(
      client,
      payload,
      this.messagesService,
      this.messagesGateway,
    );
  }

  @SubscribeMessage('updateMessage')
  async handleEditMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { messageId: string; content: string },
  ) {
    return handleEditMessageLogic(
      client,
      payload,
      this.messagesService,
      this.messagesGateway,
    );
  }

  @SubscribeMessage('removeMessage')
  async handleRemoveMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { messageId: string },
  ) {
    return handleRemoveMessageLogic(
      client,
      payload,
      this.messagesService,
      this.messagesGateway,
    );
  }

  @SubscribeMessage('slashCommand')
  dispatchInteraction(interaction: {
    appId: string;
    botId: string;
    command: string;
    channelId: string;
    userId: string;
    args: Record<string, any>;
    token: string;
  }) {
    // send only to sockets in the room for that app
    this.server
      .to(`app:${interaction.appId}`)
      .emit('interactionCreate', interaction);
  }
}
