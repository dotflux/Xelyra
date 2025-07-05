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
}
