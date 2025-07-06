import { Socket } from 'socket.io';
import { BotsService } from 'src/services/bots.service';
import { SlashCommandsService } from 'src/services/slashCommands.service';

export async function handleValidateCommandLogic(
  client: Socket,
  payload: { command: string; options: any[]; description: string },
  botsService: BotsService,
  slashService: SlashCommandsService,
) {
  const token = client.handshake.auth?.token;
  if (!token) return client.disconnect();
  const bot = await botsService.findByToken(token);
  if (bot.length === 0) return client.disconnect();

  const appId = bot[0].app_id;

  const command = await slashService.findCommand(appId, payload.command);
  const newOptions = JSON.stringify(
    payload.options && payload.options.length > 0 ? payload.options : [],
  );
  if (command.length === 0) {
    try {
      await slashService.createSlashCmd(
        appId,
        payload.command,
        payload.description,
        newOptions,
      );
    } catch (err) {
      return client.emit('error', {
        reason: `Failed to create command ${payload.command}`,
      });
    }
  }
  // Command exists, check if info matches
  const dbDesc = command[0].description || '';
  const dbOptions = command[0].options || '[]';
  if (dbDesc !== payload.description || dbOptions !== newOptions) {
    // Update the command
    await slashService.updateSlashCmd(
      appId,
      payload.command,
      payload.description,
      newOptions,
    );
  }
  client.emit('commandValidated', { command: payload.command });
}
