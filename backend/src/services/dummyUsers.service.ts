import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';

@Injectable()
export class DummyUsersService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createDummyUser(
    id: string,
    username: string,
    email: string,
    password: string,
    otp: string,
  ) {
    const createdAt = new Date();
    const query = `
      INSERT INTO xelyra.dummyUsers (id, username, email, password, otp, created_at)
      VALUES (?, ?, ?, ?, ?,?)
    `;
    const params = [id, username, email, password, otp, createdAt];
    try {
      await this.scyllaService.execute(query, params);
    } catch (err) {
      console.error('Error inserting dummy user:', err);
      throw err;
    }
  }

  async findByEmail(email: string) {
    const query = `SELECT * FROM xelyra.dummyUsers WHERE email=?`;
    const params = [email];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding dummyUser by email:', err);
      throw err;
    }
  }

  async deleteById(id: string) {
    const query = `DELETE FROM xelyra.dummyUsers WHERE id=?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding dummyUser by email:', err);
      throw err;
    }
  }
}
