import io from "socket.io-client";
import { Socket } from "socket.io-client";
import EventEmitter from "eventemitter3";
import { XelyraEvents, UUID, InteractionContext, Button, Embed } from "./types";
import { BotMessage } from "./structures/botMessage";

export interface ClientOptions {
  gatewayUrl?: string;
  token: string;
}

export class XelyraClient extends EventEmitter<XelyraEvents> {
  private socket!: Socket;
  private readonly token: string;
  private readonly gatewayUrl: string;
  private commands: Map<string, (ctx: InteractionContext) => void> = new Map();
  private pendingValidations: Map<string, any[]> = new Map();
  private buttonCallbacks: Map<string, (ctx: InteractionContext) => void> =
    new Map();

  constructor(options: ClientOptions) {
    super();
    this.token = options.token;
    this.gatewayUrl = options.gatewayUrl ?? "http://localhost:3000/bot";
    this.socket = undefined as any;
    this.buttonCallbacks = new Map();
  }

  // Connects to the Socket.IO gateway and emits "ready" on success
  public login(): void {
    // Initialize the socket
    this.socket = io(this.gatewayUrl, {
      auth: { token: this.token },
      transports: ["websocket"], // force WebSocket
    });

    // When the underlying socket connects, notify consumers
    this.socket.on("connect", () => {
      this.emit("ready");
      // Emit all unique pending validations
      for (const [name, value] of this.pendingValidations.entries()) {
        const [options, description] =
          Array.isArray(value) && value.length === 2
            ? value
            : [value, "No description"];
        this.socket.emit("validateCommand", {
          token: this.token,
          command: name,
          options,
          description,
        });
      }
      this.pendingValidations.clear();
    });

    this.socket.on("disconnect", (reason: string) => {
      console.warn("[XelyraClient] disconnected:", reason);
    });
    this.socket.on("connect_error", (err: Error) => {
      console.error("[XelyraClient] connection error:", err);
    });

    this.socket.on("interactionCreate", (raw: any) => {
      const handler = this.commands.get(raw.command);
      if (!handler) return;

      const ctx: InteractionContext = {
        command: raw.command,
        userId: raw.userId,
        channelId: raw.channelId,
        appId: raw.appId,
        botId: raw.botId,
        token: raw.token,
        args: raw.args,
        respond: (content: string, ephemeral = false) => {
          this.socket.emit("respondInteraction", {
            token: raw.token,
            data: { content, ephemeral },
          });
        },
        send: (message: string, embeds?: Embed[], buttons?: Button[]) => {
          return this.sendMessage(
            raw.channelId,
            message,
            raw.command,
            raw.userId,
            embeds,
            buttons
          );
        },
        getMessage: () => {
          throw new Error("getMessage is not available in command interactions");
        },
      };

      handler(ctx);
    });

    this.socket.on(
      "buttonClicked",
      (data: {
        customId: string;
        appId: string;
        botId: string;
        command: string;
        channelId: string;
        userId: string;
        messageId: string;
      }) => {
        console.log("buttonClicked", data);
        console.log(
          "Available callbacks:",
          Array.from(this.buttonCallbacks.keys())
        );
        const cb = this.buttonCallbacks.get(data.customId);
        console.log("Found callback for", data.customId, ":", !!cb);
        if (!cb) return;

        const ctx: InteractionContext = {
          channelId: data.channelId,
          userId: data.userId,
          command: data.command,
          appId: data.appId,
          botId: data.botId,
          token: this.token,
          args: {},
          respond: (content: string, ephemeral?: boolean) => {
            return this.sendMessage(
              data.channelId,
              content,
              data.command,
              data.userId
            );
          },
          send: (message: string, embeds?: Embed[], buttons?: Button[]) => {
            return this.sendMessage(
              data.channelId,
              message,
              data.command,
              data.userId,
              embeds,
              buttons
            );
          },
          getMessage: () => {
            return new BotMessage(data.messageId, data.channelId, this);
          },
        };

        cb(ctx);
      }
    );
  }

  public command(
    name: string,
    handler: (ctx: InteractionContext) => void,
    options: any[] = [],
    description: string = "No description"
  ): void {
    this.commands.set(name, handler);
    if (this.socket && this.socket.connected) {
      this.socket.emit("validateCommand", {
        token: this.token,
        command: name,
        options,
        description,
      });
    } else {
      this.pendingValidations.set(name, [options, description]);
    }
  }

  public registerButtonCallback(
    commandName: string,
    customId: string,
    callback: (ctx: InteractionContext) => void
  ): void {
    this.buttonCallbacks.set(customId, callback);
  }

  public sendMessage(
    channelId: string,
    message: string,
    command: string,
    user: string,
    embeds?: Embed[],
    buttons?: Button[]
  ): Promise<BotMessage> {
    return new Promise((resolve, reject) => {
      if (!this.socket.connected)
        return reject(new Error("Socket not connected"));

      this.socket.emit("sendMessage", {
        channelId,
        message,
        command,
        user,
        embeds,
        buttons,
      });
      const onAck = (ack: { id: UUID; created_at: string }) => {
        const botMsg = new BotMessage(ack.id, channelId, this);
        resolve(botMsg);
        this.socket.off("messageSent", onAck);
      };
      this.socket.on("messageSent", onAck);
      setTimeout(() => {
        this.socket.off("messageSent", onAck);
        reject(new Error("sendMessage timeout"));
      }, 5000);
    });
  }

  public editMessage(
    messageId: string,
    content: string,
    embeds?: Embed[] | null,
    buttons?: Button[] | null
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket.connected) {
        return reject(new Error("Socket not connected"));
      }

      this.socket.emit("updateMessage", {
        messageId,
        content,
        embeds,
        buttons,
      });

      const onAck = (ack: { id: string; created_at: string }) => {
        resolve();
        this.socket.off("messageUpdate", onAck);
      };

      this.socket.on("messageUpdate", onAck);

      setTimeout(() => {
        this.socket.off("messageUpdate", onAck);
        reject(new Error("editMessage timeout"));
      }, 5000);
    });
  }

  public deleteMessage(messageId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket.connected) {
        return reject(new Error("Socket not connected"));
      }

      this.socket.emit("removeMessage", { messageId });

      const onAck = (ack: { id: string; created_at: string }) => {
        resolve();
        this.socket.off("messageRemoved", onAck);
      };

      this.socket.on("messageRemoved", onAck);

      setTimeout(() => {
        this.socket.off("messageRemoved", onAck);
        reject(new Error("deleteMessage timeout"));
      }, 5000);
    });
  }
}
