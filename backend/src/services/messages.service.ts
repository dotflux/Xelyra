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
  ) {
    const createdAt = uuidv1();
    const createdAtTs = new Date();
    const validReplyTo =
      replyTo && /^[0-9a-fA-F-]{36}$/.test(replyTo) ? replyTo : null;
    const query = `
      INSERT INTO xelyra.messages (id, message, user, conversation, is_read, edited, created_at, reply_to)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
    ];
    try {
      await this.scyllaService.execute(query, params);
      return {
        conversation,
        message,
        sender: user,
        created_at: createdAt,
        created_timestamp: createdAtTs.toISOString(),
        id,
        edited,
        replyTo,
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

  async getMessages(conversation: string) {
    const query = `SELECT id, user, message, conversation, is_read, edited, reply_to, created_at, toTimestamp(created_at) AS created_timestamp
FROM xelyra.messages
WHERE conversation = ?
ORDER BY created_at DESC
LIMIT 10;`;
    const params = [conversation];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding message by id:', err);
      throw err;
    }
  }

  async getOlderMessages(conversation: string, created_at: string) {
    const query = `SELECT id, user, message, conversation, is_read, edited, reply_to, created_at, toTimestamp(created_at) AS created_timestamp
FROM xelyra.messages
WHERE conversation = ? AND created_at < ?
ORDER BY created_at DESC
LIMIT 10;`;
    const params = [conversation, created_at];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding message by id:', err);
      throw err;
    }
  }
}
