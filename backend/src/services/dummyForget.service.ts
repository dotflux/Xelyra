import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';

@Injectable()
export class DummyForgetService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createDummyForget(
    id: string,
    email: string,
    password: string,
    otp: string,
  ) {
    const createdAt = new Date();
    const query = `
      INSERT INTO xelyra.dummyForget (id, email, new_password, otp, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [id, email, password, otp, createdAt];
    try {
      await this.scyllaService.execute(query, params);
    } catch (err) {
      console.error('Error inserting dummy forget:', err);
      throw err;
    }
  }

  async findById(id: string) {
    const query = `SELECT * FROM xelyra.dummyForget WHERE id=?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding dummyForget by id:', err);
      throw err;
    }
  }

  async deleteById(id: string) {
    const query = `DELETE FROM xelyra.dummyForget WHERE id=?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding dummyForget by id:', err);
      throw err;
    }
  }
}
