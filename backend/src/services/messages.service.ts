import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';
import { v1 as uuidv1 } from 'uuid';

@Injectable()
export class MessagesService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createMessage(
    id: string,
    message: string,
    user: string,
    conversation: string,
    isRead: boolean,
    edited: boolean,
    replyTo: string,
    files?: any[],
  ) {
    const createdAt = uuidv1();
    const createdAtTs = new Date();
    const validReplyTo =
      replyTo && /^[0-9a-fA-F-]{36}$/.test(replyTo) ? replyTo : null;
    const filesValue = files || [];
    const query = `
      INSERT INTO xelyra.messages (id, message, user, conversation, is_read, edited, created_at, reply_to, files)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      id,
      message,
      user,
      conversation,
      isRead,
      edited,
      createdAt,
      validReplyTo,
      filesValue,
    ];
    try {
      await this.scyllaService.execute(query, params);
      return {
        conversation,
        message,
        user: user,
        created_at: createdAt,
        created_timestamp: createdAtTs.toISOString(),
        id,
        edited,
        reply_to: replyTo,
        files: filesValue,
      };
    } catch (err) {
      console.error('Error inserting messages:', err);
      throw err;
    }
  }

  async findById(id: string) {
    const query = `SELECT * FROM xelyra.messages WHERE id = ?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding message by id:', err);
      throw err;
    }
  }

  async createCommandLookup(
    id: string,
    bot_id: string,
    app_id: string,
    conversation: string,
    command: string,
    created_at_uuid: string,
  ) {
    const query = `INSERT INTO xelyra.command_lookup (id, bot_id, app_id, conversation,command,created_at) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [id, bot_id, app_id, conversation, command, created_at_uuid];
    try {
      await this.scyllaService.execute(query, params);
      return {
        id,
        bot_id,
        app_id,
        conversation,
        command,
      };
    } catch (err) {
      console.error('Error creating command lookup:', err);
      throw err;
    }
  }

  async findByCommandId(id: string) {
    const query = `SELECT * FROM xelyra.command_lookup WHERE id = ?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding message by id:', err);
      throw err;
    }
  }

  async findCommand(conversation: string, created_at: string) {
    const query = `SELECT * FROM xelyra.commands WHERE conversation = ? AND created_at = ?`;
    const params = [conversation, created_at];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding message by id:', err);
      throw err;
    }
  }

  async editCommand(
    conversation: string,
    created_at: string,
    newText: string,
    embeds?: any[] | null,
  ) {
    let query: string;
    let params: any[];
    if (embeds === undefined) {
      query = `UPDATE xelyra.commands SET message = ?,edited = true WHERE conversation = ? AND created_at = ?`;
      params = [newText, conversation, created_at];
    } else {
      // Serialize embeds as JSON strings
      const embedsValue = Array.isArray(embeds)
        ? embeds.map((e) => (typeof e === 'string' ? e : JSON.stringify(e)))
        : [];
      query = `UPDATE xelyra.commands SET message = ?,edited = true, embeds = ? WHERE conversation = ? AND created_at = ?`;
      params = [newText, embedsValue, conversation, created_at];
    }
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error edit message by id:', err);
      throw err;
    }
  }

  async deleteCommand(conversation: string, created_at: string) {
    const query = `DELETE FROM xelyra.commands WHERE conversation = ? AND created_at = ?`;
    const params = [conversation, created_at];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error edit message by id:', err);
      throw err;
    }
  }

  async findByTimeId(id: string) {
    const query = `SELECT * FROM xelyra.messages WHERE created_at = ?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding message by id:', err);
      throw err;
    }
  }

  async editMsg(conversation: string, created_at: string, newText: string) {
    const query = `UPDATE xelyra.messages SET message = ?,edited = true WHERE conversation = ? AND created_at = ?`;
    const params = [newText, conversation, created_at];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error edit message by id:', err);
      throw err;
    }
  }

  async deleteMsg(conversation: string, created_at: string) {
    const query = `DELETE FROM xelyra.messages WHERE conversation = ? AND created_at = ?`;
    const params = [conversation, created_at];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error edit message by id:', err);
      throw err;
    }
  }

  async getMessages(conversation: string, limit = 30) {
    const query = `SELECT id, user, message, conversation, is_read, edited, reply_to, created_at, toTimestamp(created_at) AS created_timestamp, files
FROM xelyra.messages
WHERE conversation = ?
ORDER BY created_at DESC
LIMIT ?;`;
    const params = [conversation, limit];
    try {
      const results = await this.scyllaService.execute(query, params);
      return (results.rows || []).map((row: any) => ({
        ...row,
        files: row.files || [],
      }));
    } catch (err) {
      console.error('Error finding message by id:', err);
      throw err;
    }
  }

  async getOlderMessages(conversation: string, created_at: string, limit = 10) {
    const query = `SELECT id, user, message, conversation, is_read, edited, reply_to, created_at, toTimestamp(created_at) AS created_timestamp, files
FROM xelyra.messages
WHERE conversation = ? AND created_at < ?
ORDER BY created_at DESC
LIMIT ?;`;
    const params = [conversation, created_at, limit];
    try {
      const results = await this.scyllaService.execute(query, params);
      return (results.rows || []).map((row: any) => ({
        ...row,
        files: row.files || [],
      }));
    } catch (err) {
      console.error('Error finding message by id:', err);
      throw err;
    }
  }

  async createCommand(
    id: string,
    command: string,
    message: string,
    bot_id: string,
    app_id: string,
    user: string,
    conversation: string,
    edited: boolean,
    embeds?: any[],
    buttons?: any[],
  ) {
    const createdAt = uuidv1();
    const createdAtTs = new Date();
    const embedsValue = Array.isArray(embeds)
      ? embeds.map((e) => (typeof e === 'string' ? e : JSON.stringify(e)))
      : [];
    const buttonsValue = Array.isArray(buttons)
      ? buttons.map((b) => (typeof b === 'string' ? b : JSON.stringify(b)))
      : [];
    const query = `INSERT INTO xelyra.commands (id, command, message, bot_id, app_id, user, conversation, edited, created_at, embeds, buttons) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [
      id,
      command,
      message,
      bot_id,
      app_id,
      user,
      conversation,
      edited,
      createdAt,
      embedsValue,
      buttonsValue,
    ];
    try {
      await this.scyllaService.execute(query, params);
      return {
        conversation,
        message,
        bot_id: bot_id,
        command: command,
        user: user,
        created_at: createdAt,
        created_timestamp: createdAtTs.toISOString(),
        id,
        edited,
        embeds: embedsValue,
        buttons: buttonsValue,
      };
    } catch (err) {
      console.error('Error creating command:', err);
      throw err;
    }
  }

  async getCommands(conversation: string, limit = 30) {
    const query = `SELECT id, command, message, bot_id, app_id, user, conversation, edited, created_at, toTimestamp(created_at) AS created_timestamp, embeds, buttons
FROM xelyra.commands
WHERE conversation = ?
ORDER BY created_at DESC
LIMIT ?;`;
    const params = [conversation, limit];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding commands:', err);
      throw err;
    }
  }

  async getOlderCommands(conversation: string, created_at: string, limit = 10) {
    const query = `SELECT id, command, message, bot_id, user, conversation, edited, created_at, toTimestamp(created_at) AS created_timestamp
FROM xelyra.commands
WHERE conversation = ? AND created_at < ?
ORDER BY created_at DESC
LIMIT ?;`;
    const params = [conversation, created_at, limit];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding older commands:', err);
      throw err;
    }
  }
}
