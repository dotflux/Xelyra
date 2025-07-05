import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';

@Injectable()
export class ApplicationsService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createApplication(
    app_id: string,
    owner_id: string,
    name: string,
    description: string,
  ) {
    const createdAt = new Date();
    const query = `
      INSERT INTO xelyra.applications (app_id,owner_id,name,description,created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [app_id, owner_id, name, description, createdAt];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error inserting application:', err);
      throw err;
    }
  }

  async findById(id: string) {
    const query = `SELECT * FROM xelyra.applications WHERE app_id = ?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding application by id:', err);
      throw err;
    }
  }

  async updateName(id: string, name: string) {
    const query = `UPDATE xelyra.applications SET name=? WHERE app_id=?`;
    const params = [name, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error updating application name:', err);
      throw err;
    }
  }

  async updateDescription(id: string, description: string) {
    const query = `UPDATE xelyra.applications SET description=? WHERE app_id=?`;
    const params = [description, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error updating application description:', err);
      throw err;
    }
  }
}
