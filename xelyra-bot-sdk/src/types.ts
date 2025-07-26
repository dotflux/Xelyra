import { BotMessage } from "./structures/botMessage";

export type UUID = string;

export interface XelyraEvents {
  ready: () => void;
}

export interface Embed {
  title?: string;
  description?: string;
  color?: string;
  image?: string;
  fields?: Array<{
    name: string;
    value: string;
  }>;
}

export interface Button {
  name: string;
  color: string;
  style?: "primary" | "secondary" | "success" | "danger";
  customId: string;
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
  send: (
    message: string,
    embeds?: Embed[],
    buttons?: Button[]
  ) => Promise<BotMessage>;
  getMessage: () => BotMessage;
}
