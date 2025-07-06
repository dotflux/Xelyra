import { UUID } from "../types";
import { XelyraClient } from "src/client";

export class BotMessage {
  constructor(
    public id: UUID,
    public channelId: UUID,
    private client: XelyraClient
  ) {}

  public edit(newContent: string): Promise<void> {
    return this.client.editMessage(this.id, newContent);
  }

  public delete(): Promise<void> {
    return this.client.deleteMessage(this.id);
  }
}
