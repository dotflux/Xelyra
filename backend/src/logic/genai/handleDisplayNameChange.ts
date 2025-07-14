import { changeDisplayName } from '../home/user/changeDisplayName';
import { v4 as uuidv4 } from 'uuid';

export async function handleDisplayNameChange({
  response,
  req,
  usersService,
  messagesGateway,
  messagesService,
  conversationId,
  replyTo,
  files,
}) {
  if (!response.includes('CHANGE_DISPLAYNAME:')) return false;
  const match = response.match(/CHANGE_DISPLAYNAME:.*$/m);
  if (!match) return true;
  const newName = match[0].replace('CHANGE_DISPLAYNAME:', '').trim();
  await changeDisplayName(req, newName, usersService, messagesGateway);
  const msg = 'Display name changed to ' + newName;
  const newId = uuidv4();
  const saved = await messagesService.createMessage(
    newId,
    msg,
    process.env.AI_ID as string,
    conversationId,
    false,
    false,
    replyTo,
    files,
  );
  messagesGateway.sendToConversation(conversationId, {
    conversation: conversationId,
    message: msg,
    user: process.env.AI_ID as string,
    created_at: saved.created_at,
    created_timestamp: saved.created_timestamp,
    id: newId,
    reply_to: replyTo,
    files: files || [],
  });
  return true;
}
