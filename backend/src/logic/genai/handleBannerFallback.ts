import { v4 as uuidv4 } from 'uuid';
import { changeBannerTheme } from '../home/user/changeBannerTheme';

export async function handleBannerFallback({
  message,
  response,
  req,
  usersService,
  messagesGateway,
  genaiImageService,
  messagesService,
  conversationId,
  replyTo,
  files,
}) {
  const wantsBanner = /(set|make|use|put|apply)[^\n]{0,40}banner/i.test(
    message,
  );
  const genImageMatch = response.match(/GENERATE_IMAGE:(.*)/is);
  if (!(wantsBanner && genImageMatch)) return false;
  const prompt = genImageMatch[1].trim();
  try {
    const generatedImage = await genaiImageService.generateImage(prompt);
    await changeBannerTheme(
      req,
      usersService,
      messagesGateway,
      undefined,
      undefined,
      undefined,
      undefined,
      generatedImage,
    );
    const msg = 'Banner changed (AI-generated).';
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
  } catch (err) {
    const msg = 'Failed to generate banner.';
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
}
