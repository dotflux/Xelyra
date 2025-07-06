import { Socket } from 'socket.io';
import { MessagesService } from 'src/services/messages.service';
import { MessagesGateway } from '../messages.gateway';

export async function handleEditMessageLogic(
  client: Socket,
  payload: { messageId: string; content: string },
  messagesService: MessagesService,
  messagesGateway: MessagesGateway,
) {
  try {
    const botId = client.data.botId;

    // First find the command lookup to get the conversation and created_at
    const commandLookup = await messagesService.findByCommandId(
      payload.messageId,
    );
    if (commandLookup.length === 0) {
      return client.emit('error', { reason: 'Invalid message id' });
    }

    // Then find the actual command to verify ownership
    const command = await messagesService.findCommand(
      commandLookup[0].conversation,
      commandLookup[0].created_at,
    );
    if (command.length === 0) {
      return client.emit('error', { reason: 'Command not found' });
    }

    if (command[0].bot_id.toString() !== botId.toString()) {
      return client.emit('error', { reason: 'Invalid Sender' });
    }

    await messagesService.editCommand(
      commandLookup[0].conversation.toString(),
      commandLookup[0].created_at,
      payload.content,
    );

    messagesGateway.emitCommandEdit(
      commandLookup[0].conversation.toString(),
      payload.messageId,
      payload.content,
      true,
    );

    client.emit('messageUpdate', {
      id: payload.messageId,
      created_at: commandLookup[0].created_at,
    });
  } catch (err) {
    console.error('Error in editMessage bot:', err);
  }
}
