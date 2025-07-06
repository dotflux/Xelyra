import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';
import { Permission } from 'src/services/roles.service';

@Injectable()
export class ChannelOverwritesService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createChannelOverwrite(
    channel_id: string,
    target_id: string,
    allow: Permission[],
    deny: Permission[],
  ) {
    const query = `
      INSERT INTO xelyra.channel_overwrites (channel_id,target_id,"allow","deny")
      VALUES (?, ?, ?, ?)
    `;
    const params = [channel_id, target_id, allow, deny];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error inserting channel overwrite:', err);
      throw err;
    }
  }

  async findById(channel_id: string, role_id: string) {
    const query = `SELECT * FROM xelyra.channel_overwrites WHERE channel_id = ? AND target_id = ?`;
    const params = [channel_id, role_id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding channel overwrite by id:', err);
      throw err;
    }
  }

  async findAllChannelOverwrites(channel: string) {
    const query = `SELECT * FROM xelyra.channel_overwrites WHERE channel_id = ?`;
    const params = [channel];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error(
        'Error finding all channels overwrites by channel id:',
        err,
      );
      throw err;
    }
  }

  async findRelevantOverwrites(channelId: string, targetIds: string[]) {
    const query = `
      SELECT target_id, "allow", "deny"
        FROM xelyra.channel_overwrites
       WHERE channel_id = ?
         AND target_id IN ?
    `;

    const params = [channelId, targetIds];

    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows.map((r) => ({
        targetId: r.target_id,
        allow: r.allow || [],
        deny: r.deny || [],
      }));
    } catch (err) {
      console.error(
        'Error finding all channels overwrites by channel id:',
        err,
      );
      throw err;
    }
  }

  async updateOverwrite(
    channelId: string,
    roleId: string,
    allowToAdd: Permission[],
    allowToRemove: Permission[],
    denyToAdd: Permission[],
    denyToRemove: Permission[],
  ) {
    const query = `UPDATE xelyra.channel_overwrites SET "allow"="allow"+?, "allow"="allow"-?, "deny"="deny"+?, "deny"="deny"-? WHERE channel_id = ? AND target_id = ?`;
    const params = [
      allowToAdd,
      allowToRemove,
      denyToAdd,
      denyToRemove,
      channelId,
      roleId,
    ];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error updating channel overwrites:', err);
      throw err;
    }
  }
}
