import { v4 as uuidv4 } from 'uuid';

const colorNameToHex = {
  black: '#000000',
  white: '#ffffff',
  gray: '#808080',
  grey: '#808080',
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff',
  yellow: '#ffff00',
  purple: '#800080',
  pink: '#ffc0cb',
  orange: '#ffa500',
  brown: '#a52a2a',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  silver: '#c0c0c0',
  gold: '#ffd700',
  navy: '#000080',
  teal: '#008080',
  lime: '#00ff00',
  maroon: '#800000',
  olive: '#808000',
};

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
  if (!match) return true;
  let themeValue = match[0].replace('CHANGE_THEME:', '').trim();
  themeValue = themeValue.replace(/[,\.]/g, ' ');
  themeValue = themeValue.replace(/\band\b/gi, ' ');
  let colors = themeValue
    .split(/\s+/)
    .map((c) => c.trim().toLowerCase())
    .filter((c) => c.length > 0)
    .map((c) => {
      if (/^#[0-9a-f]{6}$/.test(c)) return c;
      if (colorNameToHex[c]) return colorNameToHex[c];
      return '';
    })
    .filter((c) => /^#[0-9a-f]{6}$/.test(c));
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
