import { randomBytes } from 'crypto';

export function generateBotToken(appId: string, botId: string): string {
  const raw = `${botId}.${randomBytes(32).toString('hex')}`;
  return raw;
}
