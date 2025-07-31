import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';

@Injectable()
export class ServerAppsService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createServerApp(server_id: string, app_id: string, roles: string[]) {
    const createdAt = new Date();
    const query = `
      INSERT INTO xelyra.server_apps (server_id,app_id,roles,joined_at)
      VALUES (?, ?, ?, ?)
    `;
    const params = [server_id, app_id, roles, createdAt];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error inserting server_app:', err);
      throw err;
    }
  }

  async findById(server: string, id: string) {
    const query = `SELECT * FROM xelyra.server_apps WHERE server_id = ? AND app_id = ?`;
    const params = [server, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding server_apps by app_id:', err);
      throw err;
    }
  }

  async findAll(serverId: string) {
    const query = `SELECT * FROM xelyra.server_apps WHERE server_id = ?`;
    const params = [serverId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding all server apps:', err);
      throw err;
    }
  }

  async fetchBatch(serverId: string, limit: number = 70, afterId?: string) {
    let query: string;
    let params: any[];
    if (afterId) {
      query = `SELECT * FROM xelyra.server_apps WHERE server_id = ? AND app_id > ? LIMIT ?`;
      params = [serverId, afterId, limit];
    } else {
      query = `SELECT * FROM xelyra.server_apps WHERE server_id = ? LIMIT ?`;
      params = [serverId, limit];
    }
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error fetching server apps batch:', err);
      throw err;
    }
  }

  async findAppServers(id: string) {
    const query = `SELECT * FROM xelyra.server_apps WHERE app_id = ?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding all server_apps by app_id:', err);
      throw err;
    }
  }

  async assignRole(server: string, id: string, role: string) {
    const query = `UPDATE xelyra.server_apps SET roles=roles+[?] WHERE server_id = ? AND app_id = ?`;
    const params = [role, server, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error assigning role to server_app:', err);
      throw err;
    }
  }
  async removeRole(server: string, id: string, role: string) {
    const query = `UPDATE xelyra.server_apps SET roles=roles-[?] WHERE server_id = ? AND app_id = ?`;
    const params = [role, server, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error assigning role to server_app:', err);
      throw err;
    }
  }

  async removeApp(server: string, id: string) {
    const query = `DELETE FROM xelyra.server_apps WHERE server_id = ? AND app_id = ?`;
    const params = [server, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error removing server app:', err);
      throw err;
    }
  }
}
