import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';
import { types } from 'cassandra-driver';

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
export class RolesService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createRole(
    server: string,
    id: string,
    name: string,
    level: Number,
    color: string,
    permissions: Permission[],
  ) {
    const query = `
      INSERT INTO xelyra.roles (server_id, role_id, name, level, color, permissions)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [server, id, name, level, color, permissions];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error inserting role:', err);
      throw err;
    }
  }

  async findById(id: string) {
    const query = `SELECT * FROM xelyra.roles WHERE role_id = ?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding role by id:', err);
      throw err;
    }
  }

  async findAllServerRoles(server: string) {
    const query = `SELECT name,role_id,color FROM xelyra.roles WHERE server_id = ?`;
    const params = [server];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows.map((row) => ({
        name: row.name,
        role_id: row.role_id,
        color: row.color,
      }));
    } catch (err) {
      console.error('Error finding role by id:', err);
      throw err;
    }
  }

  async findAllServerRolesFull(server: string) {
    const query = `SELECT role_id, name, color, level, permissions FROM xelyra.roles WHERE server_id = ?`;
    const params = [server];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding all server roles (full):', err);
      throw err;
    }
  }

  async renameRole(serverId: string, roleId: string, newName: string) {
    const query = `UPDATE xelyra.roles SET name = ? WHERE server_id = ? AND role_id = ?`;
    const params = [newName, serverId, roleId];
    try {
      await this.scyllaService.execute(query, params);
    } catch (err) {
      console.error('Error renaming role:', err);
      throw err;
    }
  }

  async changeRoleColor(serverId: string, roleId: string, color: string) {
    const query = `UPDATE xelyra.roles SET color = ? WHERE server_id = ? AND role_id = ?`;
    const params = [color, serverId, roleId];
    try {
      await this.scyllaService.execute(query, params);
    } catch (err) {
      console.error('Error changing role color:', err);
      throw err;
    }
  }

  async updateRolePermissions(
    serverId: string,
    roleId: string,
    permissions: string[],
  ) {
    const query = `UPDATE xelyra.roles SET permissions = ? WHERE server_id = ? AND role_id = ?`;
    const params = [permissions, serverId, roleId];
    try {
      await this.scyllaService.execute(query, params);
    } catch (err) {
      console.error('Error updating role permissions:', err);
      throw err;
    }
  }
}
