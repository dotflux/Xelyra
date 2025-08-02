import { v4 as uuidv4 } from 'uuid';

export async function handleImageGeneration({
  response,
  message,
  req,
  genaiImageService,
  messagesService,
  messagesGateway,
  conversationId,
  replyTo,
  files,
}) {
  if (!response.trim().includes('GENERATE_IMAGE:')) return false;
  let imagePrompt = null;
  if (response.trim().startsWith('GENERATE_IMAGE:'))
    imagePrompt = response.replace('GENERATE_IMAGE:', '').trim();
  if (
    !imagePrompt &&
    /\b(generate|show|draw|picture|image|visual|look like)\b/i.test(message) &&
    !response.includes('CHANGE_PFP:')
  )
    imagePrompt = message;
  if (!imagePrompt) return true;
  try {
    const generatedImage = await genaiImageService.generateImage(imagePrompt);
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '../../../uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
    const filename = `genai_${Date.now()}_${Math.random().toString(36).slice(2)}.${generatedImage.ext}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, generatedImage.buffer);
    const fileUrl = `/uploads/${filename}`;
    const generatedImageFile = {
      url: fileUrl,
      filename,
      type: `image/${generatedImage.ext}`,
      size: generatedImage.buffer.length,
    };
    const msg = 'Here is what you asked for:';
    const newId = uuidv4();
    const saved = await messagesService.createMessage(
      newId,
      msg,
      process.env.AI_ID as string,
      conversationId,
      false,
      false,
      replyTo,
      [generatedImageFile],
    );
    messagesGateway.sendToConversation(conversationId, {
      conversation: conversationId,
      message: msg,
      user: process.env.AI_ID as string,
      created_at: saved.created_at,
      created_timestamp: saved.created_timestamp,
      id: newId,
      reply_to: replyTo,
      files: [generatedImageFile],
    });
    return true;
  } catch (err) {
    const msg = 'Failed to generate image.';
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
