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

  async createInvite(serverId: string, inviteId: string, createdBy: string) {
    const createdAt = new Date();
    const query = `
      INSERT INTO xelyra.server_invites (server_id, invite_id, created_by, created_at)
      VALUES (?, ?, ?, ?)
    `;
    const params = [serverId, inviteId, createdBy, createdAt];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error creating invite:', err);
      throw err;
    }
  }

  async createInviteLookup(
    serverId: string,
    inviteId: string,
    createdBy: string,
  ) {
    const query = `
      INSERT INTO xelyra.server_invite_lookup (server_id, invite_id, created_by)
      VALUES (?, ?, ?)
    `;
    const params = [serverId, inviteId, createdBy];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error creating invite lookup:', err);
      throw err;
    }
  }

  async findInviteLookup(invite_id: string) {
    const query = `
      SELECT * FROM xelyra.server_invite_lookup WHERE invite_id = ?
    `;
    const params = [invite_id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding invite lookup:', err);
      throw err;
    }
  }

  async findInviteByUser(serverId: string, createdBy: string) {
    const query = `SELECT * FROM xelyra.server_invites WHERE server_id = ? AND created_by = ?`;
    const params = [serverId, createdBy];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding invite by user:', err);
      throw err;
    }
  }

  async findInviteById(serverId: string, inviteId: string, createdBy: string) {
    const query = `SELECT * FROM xelyra.server_invites WHERE server_id = ? AND invite_id = ? AND created_by = ?`;
    const params = [serverId, inviteId, createdBy];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding invite by id:', err);
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

  async createBan(serverId: string, bannedId: string) {
    const createdAt = new Date();
    const query = `
      INSERT INTO xelyra.server_bans (server_id, banned_id, created_at)
      VALUES (?, ?, ?)
    `;
    const params = [serverId, bannedId, createdAt];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error creating ban:', err);
      throw err;
    }
  }

  async findBan(serverId: string, bannedId: string) {
    const query = `SELECT * FROM xelyra.server_bans WHERE server_id = ? AND banned_id = ?`;
    const params = [serverId, bannedId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding ban:', err);
      throw err;
    }
  }

  async removeBan(serverId: string, bannedId: string) {
    const query = `DELETE FROM xelyra.server_bans WHERE server_id = ? AND banned_id = ?`;
    const params = [serverId, bannedId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error removing ban:', err);
      throw err;
    }
  }

  async fetchBansBatch(serverId: string, limit: number = 70, afterId?: string) {
    let query: string;
    let params: any[];
    if (afterId) {
      query = `SELECT * FROM xelyra.server_bans WHERE server_id = ? AND banned_id > ? LIMIT ?`;
      params = [serverId, afterId, limit];
    } else {
      query = `SELECT * FROM xelyra.server_bans WHERE server_id = ? LIMIT ?`;
      params = [serverId, limit];
    }
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error fetching server bans batch:', err);
      throw err;
    }
  }
}
