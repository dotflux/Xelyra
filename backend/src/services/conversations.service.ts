import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';

@Injectable()
export class ConversationsService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createConversation(
    id: string,
    dm_id: string,
    participants: string[],
    type: string,
  ) {
    const createdAt = new Date();
    const query = `
      INSERT INTO xelyra.conversations (id, dm_id, participants, type, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [id, dm_id, participants, type, createdAt];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error inserting conversations:', err);
      throw err;
    }
  }

  async findById(id: string) {
    const query = `SELECT * FROM xelyra.conversations WHERE id = ?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding conversation by id:', err);
      throw err;
    }
  }

  async findDmId(id: string) {
    const query = `SELECT * FROM xelyra.conversations WHERE dm_id = ?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding conversation by dm id:', err);
      throw err;
    }
  }

  async createUnreadCounter(id: string, user: string) {
    const query = `INSERT INTO xelyra.unread_counter (conversation, user) VALUES (?, ?)`;
    const params = [id, user];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error creating unread counter:', err);
      throw err;
    }
  }

  async deleteUnreadCounter(id: string, user: string) {
    const query = `DELETE FROM xelyra.unread_counter WHERE conversation = ? AND user = ?`;
    const params = [id, user];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error deleting unread counter:', err);
      throw err;
    }
  }

  async findUnreadCounter(id: string, user: string) {
    const query = `SELECT * FROM xelyra.unread_counter WHERE conversation = ? AND user = ?`;
    const params = [id, user];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding unread counter:', err);
      throw err;
    }
  }

  async setLastMessageTimestamp(id: string, timestamp: Date) {
    const query = `UPDATE xelyra.conversations SET last_message_timestamp = ? WHERE id = ?`;
    const params = [timestamp, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error setting last message timestamp:', err);
      throw err;
    }
  }
}
