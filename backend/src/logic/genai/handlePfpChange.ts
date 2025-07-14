import { changePfp } from '../home/user/changePfp';
import { v4 as uuidv4 } from 'uuid';

export async function handlePfpChange({
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
  if (!response.includes('CHANGE_PFP:')) return false;
  const match = response.match(/CHANGE_PFP:.*$/m);
  if (!match) return true;
  const pfpValue = match[0].replace('CHANGE_PFP:', '').trim();
  if (pfpValue.startsWith('GENERATE_IMAGE:')) {
    const prompt = pfpValue.replace('GENERATE_IMAGE:', '').trim();
    try {
      const generatedImage = await genaiImageService.generateImage(prompt);
      await changePfp(
        req,
        usersService,
        messagesGateway,
        undefined,
        undefined,
        generatedImage,
      );
      const msg = 'Profile picture changed (AI-generated).';
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
      const msg = 'Failed to generate profile picture.';
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
  if (pfpValue === 'USE_LAST_IMAGE') {
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
    await changePfp(
      req,
      usersService,
      messagesGateway,
      undefined,
      imageFile.url,
      undefined,
    );
    const msg = 'Profile picture changed to your last uploaded image.';
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
  if (/^https?:\/\//.test(pfpValue)) {
    await changePfp(req, usersService, messagesGateway, undefined, pfpValue);
    const msg = 'Profile picture changed.';
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
  const msg = 'Invalid image URL or command for profile picture.';
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
