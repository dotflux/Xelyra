import { UUID, Embed, Button } from "../types";
import { XelyraClient } from "src/client";

export class BotMessage {
  constructor(
    public id: UUID,
    public channelId: UUID,
    private client: XelyraClient
  ) {}

  public edit(
    newContent: string,
    embeds?: Embed[] | null,
    buttons?: Button[]
  ): Promise<void> {
    return this.client.editMessage(this.id, newContent, embeds, buttons);
  }

  public delete(): Promise<void> {
    return this.client.deleteMessage(this.id);
  }
}
