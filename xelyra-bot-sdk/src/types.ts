import { BotMessage } from "./structures/botMessage";

export type UUID = string;

export interface XelyraEvents {
  ready: () => void;
}

export interface InteractionContext {
  command: string;
  userId: string;
  channelId: string;
  appId: string;
  botId: string;
  token: string;
  args: Record<string, any>;
  respond: (content: string, ephemeral?: boolean) => void;

  send: (message: string, embeds?: any[]) => Promise<BotMessage>;
}
