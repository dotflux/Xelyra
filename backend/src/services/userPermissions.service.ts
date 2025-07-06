import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';

export type Permission =
  | 'VIEW_CHANNEL'
  | 'SEND_MESSAGES'
  | 'MANAGE_MESSAGES'
  | 'MANAGE_CHANNELS'
  | 'MANAGE_ROLES'
  | 'BAN_USERS'
  | 'KICK_USERS'
  | 'ADMIN';

@Injectable()
export class UserPermissionsService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createUserPermission(
    server: string,
    userId: string,
    highest: number,
    permissions: Set<Permission>,
  ) {
    const query = `
      INSERT INTO xelyra.user_permissions (server_id, user_id, highest_level, permissions)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [server, userId, highest, permissions];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error inserting user permission:', err);
      throw err;
    }
  }

  async findById(server: string, user: string) {
    const query = `SELECT * FROM xelyra.user_permissions WHERE server_id = ? AND user_id = ?`;
    const params = [server, user];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding user permission by id:', err);
      throw err;
    }
  }
}
