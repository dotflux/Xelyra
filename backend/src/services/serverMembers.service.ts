import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';

@Injectable()
export class ServerMembersService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createServerMember(
    server_id: string,
    user_id: string,
    roles: string[],
  ) {
    const createdAt = new Date();
    const query = `
      INSERT INTO xelyra.server_members (server_id,user_id,roles,joined_at)
      VALUES (?, ?, ?, ?)
    `;
    const params = [server_id, user_id, roles, createdAt];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error inserting server_member:', err);
      throw err;
    }
  }

  async findById(server: string, id: string) {
    const query = `SELECT * FROM xelyra.server_members WHERE server_id = ? AND user_id = ?`;
    const params = [server, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding server_member by user_id:', err);
      throw err;
    }
  }

  async findAll(id: string) {
    const query = `SELECT * FROM xelyra.server_members WHERE server_id = ?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding server_member by server_id:', err);
      throw err;
    }
  }

  async assignRole(server: string, id: string, role: string) {
    const query = `UPDATE xelyra.server_members SET roles=roles+[?] WHERE server_id = ? AND user_id = ?`;
    const params = [role, server, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error assigning role to server_member:', err);
      throw err;
    }
  }
  async removeRole(server: string, id: string, role: string) {
    const query = `UPDATE xelyra.server_members SET roles=roles-[?] WHERE server_id = ? AND user_id = ?`;
    const params = [role, server, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error assigning role to server_member:', err);
      throw err;
    }
  }

  async removeMember(server: string, member: string) {
    const query = `DELETE * FROM xelyra.server_members WHERE server_id = ? AND user_id = ?`;
    const params = [server, member];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error removing member from server:', err);
      throw err;
    }
  }
}
