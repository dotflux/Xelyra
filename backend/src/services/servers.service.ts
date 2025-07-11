import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';

@Injectable()
export class ServersService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createServer(id: string, name: string, owner: string, type: string) {
    const createdAt = new Date();
    const query = `
      INSERT INTO xelyra.servers (id, name, owner, type, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [id, name, owner, type, createdAt];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error inserting server:', err);
      throw err;
    }
  }

  async findById(id: string) {
    const query = `SELECT * FROM xelyra.servers WHERE id = ?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding server by id:', err);
      throw err;
    }
  }

  async updateServerInfo(
    serverId: string,
    updates: { name?: string; pfp?: string },
  ) {
    const fields: string[] = [];
    const params: any[] = [];
    if (updates.name) {
      fields.push('name = ?');
      params.push(updates.name);
    }
    if (updates.pfp) {
      fields.push('pfp = ?');
      params.push(updates.pfp);
    }
    if (fields.length === 0) return;
    const query = `UPDATE xelyra.servers SET ${fields.join(', ')} WHERE id = ?`;
    params.push(serverId);
    try {
      await this.scyllaService.execute(query, params);
    } catch (err) {
      console.error('Error updating server info:', err);
      throw err;
    }
  }
}
