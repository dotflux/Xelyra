import { v4 as uuidv4 } from 'uuid';
import { changeBannerTheme } from '../home/user/changeBannerTheme';

export async function handleBannerChange({
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
  if (!response.includes('CHANGE_BANNER:')) return false;
  const match = response.match(/CHANGE_BANNER:.*$/m);
  if (!match) return true;
  const bannerValue = match[0].replace('CHANGE_BANNER:', '').trim();
  if (bannerValue.startsWith('GENERATE_IMAGE:')) {
    const prompt = bannerValue.replace('GENERATE_IMAGE:', '').trim();
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
  if (bannerValue === 'USE_LAST_IMAGE') {
    if (!Array.isArray(files) || files.length === 0) {
      const msg = 'No image file found in the files array.';
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
    const imageFile =
      files.find((f) => f.type && f.type.startsWith('image/')) || files[0];
    if (!imageFile || !imageFile.url) {
      const msg = 'No valid image file found in the files array.';
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
    await changeBannerTheme(
      req,
      usersService,
      messagesGateway,
      undefined,
      undefined,
      undefined,
      imageFile.url,
    );
    const msg = 'Banner changed to your last uploaded image.';
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
  if (/^https?:\/\//.test(bannerValue)) {
    await changeBannerTheme(
      req,
      usersService,
      messagesGateway,
      undefined,
      undefined,
      undefined,
      bannerValue,
    );
    const msg = 'Banner changed.';
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
  const msg = 'Invalid image URL or command for banner.';
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
