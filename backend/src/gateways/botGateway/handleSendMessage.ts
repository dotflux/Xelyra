import { Socket } from 'socket.io';
import { MessagesService } from 'src/services/messages.service';
import { MessagesGateway } from '../messages.gateway';
import { v4 as uuidv4 } from 'uuid';

export async function handleSendMessageLogic(
  client: Socket,
  payload: {
    channelId: string;
    message: string;
    command: string;
    user: string;
    embeds?: any[];
    buttons?: any[];
  },
  messagesService: MessagesService,
  messagesGateway: MessagesGateway,
) {
  const botId = client.data.botId;
  const appId = client.data.appId;

  if (
    !payload ||
    typeof payload.message !== 'string' ||
    !payload.message.trim()
  ) {
    return client.emit('error', { reason: 'Invalid message content' });
  }

  // 1) Persist the command message
  const saved = await messagesService.createCommand(
    uuidv4(),
    payload.command,
    payload.message,
    botId,
    appId,
    payload.user,
    payload.channelId,
    false,
    payload.embeds,
    payload.buttons,
  );

  await messagesService.createCommandLookup(
    saved.id,
    botId,
    appId,
    payload.channelId,
    payload.command,
    saved.created_at,
  );

  messagesGateway.sendToConversation(payload.channelId, saved);

  // 3) (Optionally) emit back to bot a confirmation
  client.emit('messageSent', {
    id: saved.id.toString(),
    created_at: saved.created_at,
  });
}
