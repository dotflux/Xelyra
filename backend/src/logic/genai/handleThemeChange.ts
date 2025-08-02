import { v4 as uuidv4 } from 'uuid';
import * as namer from 'color-namer';

function colorNameToHex(colorName: string): string | null {
  const normalizedName = colorName.toLowerCase().trim();

  if (/^#[0-9a-f]{6}$/i.test(normalizedName)) {
    return normalizedName.toLowerCase();
  }

  try {
    const result = namer(normalizedName);

    if (result.hex && result.hex.length > 0) {
      return result.hex[0];
    }
    if (result.rgb && result.rgb.length > 0) {
      const rgb = result.rgb[0];
      return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
    }
    if (result.hsl && result.hsl.length > 0) {
      const hsl = result.hsl[0];
      return `#${Math.round(hsl.h).toString(16).padStart(2, '0')}${Math.round(hsl.s).toString(16).padStart(2, '0')}${Math.round(hsl.l).toString(16).padStart(2, '0')}`;
    }
  } catch (error) {
    console.log(`Color parsing error for "${colorName}":`, error);
  }

  return null;
}

export async function handleThemeChange({
  response,
  req,
  usersService,
  messagesGateway,
  messagesService,
  conversationId,
  replyTo,
  files,
}) {
  if (!response.includes('CHANGE_THEME:')) return false;
  const match = response.match(/CHANGE_THEME:.*$/m);
  if (!match) {
    console.log('No CHANGE_THEME match found in response');
    return true;
  }
  let themeValue = match[0].replace('CHANGE_THEME:', '').trim();
  themeValue = themeValue.replace(/[\[\],\.]/g, ' ');
  themeValue = themeValue.replace(/\band\b/gi, ' ');
  themeValue = themeValue.replace(/\s+/g, ' ').trim();
  console.log('Theme value:', themeValue);
  let colors = themeValue
    .split(/\s+/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0)
    .map((c) => colorNameToHex(c))
    .filter((c) => c !== null);
  console.log('Processed colors:', colors);
  const { changeBannerTheme } = require('../home/user/changeBannerTheme');
  if (colors.length === 2) {
    await changeBannerTheme(
      req,
      usersService,
      messagesGateway,
      undefined,
      colors[0],
      colors[1],
    );
    const msg = 'Profile theme changed.';
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
  const msg = 'Invalid theme colors.';
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
