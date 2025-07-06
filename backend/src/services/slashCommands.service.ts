import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';

export type SlashOption = {
  name: string;
  type: 'STRING' | 'INTEGER' | 'BOOLEAN' | 'USER' | 'CHANNEL' | 'ROLE'; // like Discord
  required: boolean;
  description: string;
  value: string | number | boolean;
};

@Injectable()
export class SlashCommandsService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createSlashCmd(
    app_id: string,
    command: string,
    description: string,
    options: string,
  ) {
    const createdAt = new Date();
    const query = `
      INSERT INTO xelyra.slash_commands (app_id,command,description,options,created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [app_id, command, description, options, createdAt];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error inserting slash_command:', err);
      throw err;
    }
  }

  async findCommand(app_id: string, command: string) {
    const query = `SELECT * FROM xelyra.slash_commands WHERE app_id = ? AND command = ?`;
    const params = [app_id, command];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding command:', err);
      throw err;
    }
  }

  async findAllCommands(app_id: string) {
    const query = `SELECT * FROM xelyra.slash_commands WHERE app_id = ?`;
    const params = [app_id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding all commands:', err);
      throw err;
    }
  }

  async updateSlashCmd(
    app_id: string,
    command: string,
    description: string,
    options: string,
  ) {
    const query = `
      UPDATE xelyra.slash_commands SET description = ?, options = ? WHERE app_id = ? AND command = ?
    `;
    const params = [description, options, app_id, command];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error updating slash_command:', err);
      throw err;
    }
  }
}
