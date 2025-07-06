import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';

@Injectable()
export class ChannelsService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createCategory(server_id: string, id: string, name: string) {
    const createdAt = new Date();
    const query = `
      INSERT INTO xelyra.categories (server_id,id,name,created_at)
      VALUES (?, ?, ?, ?)
    `;
    const params = [server_id, id, name, createdAt];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error inserting category:', err);
      throw err;
    }
  }

  async createChannel(
    server_id: string,
    id: string,
    name: string,
    type: string,
    category: string,
  ) {
    const createdAt = new Date();
    const query = `
      INSERT INTO xelyra.channels (server_id,id,name,created_at,category,type)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [server_id, id, name, createdAt, category, type];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error inserting channel:', err);
      throw err;
    }
  }

  async findById(id: string) {
    const query = `SELECT * FROM xelyra.channels WHERE id = ?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding channel by id:', err);
      throw err;
    }
  }

  async findAllChannels(server: string) {
    const query = `SELECT * FROM xelyra.channels WHERE server_id = ?`;
    const params = [server];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding all channels by server id:', err);
      throw err;
    }
  }

  async findAllCategories(server: string) {
    const query = `SELECT * FROM xelyra.categories WHERE server_id = ?`;
    const params = [server];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding all channels by server id:', err);
      throw err;
    }
  }

  async findByCategory(server: string, category: string) {
    const query = `SELECT * FROM xelyra.channels WHERE server_id = ? AND category = ?`;
    const params = [server, category];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error(
        'Error finding all channels by server id and category:',
        err,
      );
      throw err;
    }
  }
}
