import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';

@Injectable()
export class BotsService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createBot(
    app_id: string,
    bot_id: string,
    token: string,
    scopes: string[],
  ) {
    const createdAt = new Date();
    const query = `
      INSERT INTO xelyra.bot_credentials (app_id,bot_id,"token",scopes,created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [app_id, bot_id, token, scopes, createdAt];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error inserting bot:', err);
      throw err;
    }
  }

  async createTokenLookup(token: string, app_id: string, bot_id: string) {
    const query = `
      INSERT INTO xelyra.bot_token_lookup ("token",app_id,bot_id)
      VALUES (?, ?, ?)
    `;
    const params = [token, app_id, bot_id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error inserting bot lookup:', err);
      throw err;
    }
  }

  async findByAppId(app_id: string) {
    const query = `SELECT * FROM xelyra.bot_credentials WHERE app_id = ?`;
    const params = [app_id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding bot by app_id:', err);
      throw err;
    }
  }

  async findById(bot_id: string) {
    const query = `SELECT * FROM xelyra.bot_credentials WHERE bot_id = ?`;
    const params = [bot_id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding bot by bot_id:', err);
      throw err;
    }
  }

  async findByToken(token: string) {
    const query = `SELECT * FROM xelyra.bot_token_lookup WHERE "token" = ?`;
    const params = [token];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding bot by id:', err);
      throw err;
    }
  }
}
