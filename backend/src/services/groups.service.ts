import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';

@Injectable()
export class GroupsService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createGroup(
    id: string,
    name: string,
    participants: string[],
    owner: string,
    type: string,
  ) {
    const createdAt = new Date();
    const query = `
      INSERT INTO xelyra.groups (id, name, participants, owner, type, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [id, name, participants, owner, type, createdAt];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error inserting group:', err);
      throw err;
    }
  }

  async findById(id: string) {
    const query = `SELECT * FROM xelyra.groups WHERE id = ?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding group by id:', err);
      throw err;
    }
  }

  async addUser(group: string, user: string) {
    const query = `UPDATE xelyra.groups SET participants = participants + [?] WHERE id = ?`;
    const params = [user, group];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error adding user to group:', err);
      throw err;
    }
  }

  async kickUser(group: string, user: string) {
    const query = `UPDATE xelyra.groups SET participants = participants - [?] WHERE id = ?`;
    const params = [user, group];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error kicking user from group:', err);
      throw err;
    }
  }

  async assignOwner(group: string, user: string) {
    const query = `UPDATE xelyra.groups SET owner = ? WHERE id = ?`;
    const params = [user, group];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error assigning a new owner:', err);
      throw err;
    }
  }

  async updatePfp(groupId: string, pfpUrl: string) {
    const query = `UPDATE xelyra.groups SET pfp = ? WHERE id = ?`;
    const params = [pfpUrl, groupId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error updating group pfp:', err);
      throw err;
    }
  }

  async updateName(groupId: string, name: string) {
    const query = `UPDATE xelyra.groups SET name = ? WHERE id = ?`;
    const params = [name, groupId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error updating group name:', err);
      throw err;
    }
  }

  async deleteGroup(group: string) {
    const query = `DELETE FROM xelyra.groups WHERE id = ?`;
    const params = [group];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error in deleting group:', err);
      throw err;
    }
  }
  async setLastMessageTimestamp(id: string, timestamp: Date) {
    const query = `UPDATE xelyra.groups SET last_message_timestamp = ? WHERE id = ?`;
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
