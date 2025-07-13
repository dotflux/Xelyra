import { Injectable } from '@nestjs/common';
import { ScyllaService } from 'src/db/scylla.service';

@Injectable()
export class UsersService {
  constructor(private readonly scyllaService: ScyllaService) {}

  async createUser(
    id: string,
    username: string,
    email: string,
    password: string,
  ) {
    const createdAt = new Date();
    const query = `
      INSERT INTO xelyra.users (id, username, email, password, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [id, username, email, password, createdAt];
    try {
      await this.scyllaService.execute(query, params);
    } catch (err) {
      console.error('Error inserting user:', err);
      throw err;
    }
  }

  async findByEmail(email: string) {
    const query = `SELECT * FROM xelyra.users WHERE email = ?`;
    const params = [email];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding user by email:', err);
      throw err;
    }
  }

  async findByUsername(username: string) {
    const query = `SELECT * FROM xelyra.users WHERE username = ?`;
    const params = [username];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding user by username:', err);
      throw err;
    }
  }

  async findById(id: string) {
    const query = `SELECT * FROM xelyra.users WHERE id = ?`;
    const params = [id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding user by id:', err);
      throw err;
    }
  }

  async appendConversation(id: string, userId: string) {
    const query = `UPDATE xelyra.users SET conversations=conversations + [?] WHERE id = ?`;
    const params = [id, userId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error appending conversation to users:', err);
      throw err;
    }
  }

  async appendGroup(id: string, userId: string) {
    const query = `UPDATE xelyra.users SET groups=groups + [?] WHERE id = ?`;
    const params = [id, userId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error appending group to users:', err);
      throw err;
    }
  }

  async removeGroup(id: string, userId: string) {
    const query = `UPDATE xelyra.users SET groups=groups - [?] WHERE id = ?`;
    const params = [id, userId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error removing group from users:', err);
      throw err;
    }
  }

  async appendServer(id: string, userId: string) {
    const query = `UPDATE xelyra.users SET servers=servers + [?] WHERE id = ?`;
    const params = [id, userId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error appending server to users:', err);
      throw err;
    }
  }

  async removeServer(id: string, userId: string) {
    const query = `UPDATE xelyra.users SET servers=servers - [?] WHERE id = ?`;
    const params = [id, userId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error removing server from users:', err);
      throw err;
    }
  }

  async appendApplication(id: string, userId: string) {
    const query = `UPDATE xelyra.users SET applications=applications + [?] WHERE id = ?`;
    const params = [id, userId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error adding application to users:', err);
      throw err;
    }
  }

  async updateDisplayName(id: string, newName: string) {
    const query = `UPDATE xelyra.users SET display_name = ? WHERE id = ?`;
    const params = [newName, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error updating display name:', err);
      throw err;
    }
  }

  async updatePfp(id: string, pfpUrl: string) {
    const query = `UPDATE xelyra.users SET pfp = ? WHERE id = ?`;
    const params = [pfpUrl, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error updating pfp:', err);
      throw err;
    }
  }

  async updateBio(id: string, bio: string) {
    const query = `UPDATE xelyra.users SET bio = ? WHERE id = ?`;
    const params = [bio, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error updating bio:', err);
      throw err;
    }
  }

  async updateUsername(id: string, username: string) {
    const query = `UPDATE xelyra.users SET username = ? WHERE id = ?`;
    const params = [username, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error updating username:', err);
      throw err;
    }
  }

  async updatePassword(id: string, password: string) {
    const query = `UPDATE xelyra.users SET password = ? WHERE id = ?`;
    const params = [password, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error updating password:', err);
      throw err;
    }
  }

  async setXynId(id: string, userId: string) {
    const query = `UPDATE xelyra.users SET xyn_id = ? WHERE id = ?`;
    const params = [id, userId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error setting xyn id:', err);
      throw err;
    }
  }

  async findRequest(senderId: string, recieverId: string) {
    const query = `SELECT * FROM xelyra.requests WHERE reciever_id = ? AND sender_id = ?`;
    const params = [recieverId, senderId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding request:', err);
      throw err;
    }
  }

  async findRequestSent(senderId: string, recieverId: string) {
    const query = `SELECT * FROM xelyra.requests_sent WHERE sender_id = ? AND reciever_id = ?`;
    const params = [senderId, recieverId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error finding request sent:', err);
      throw err;
    }
  }

  async addFriend(userId: string, friendId: string) {
    const query = `UPDATE xelyra.users SET friends=friends + [?] WHERE id = ?`;
    const params = [friendId, userId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error adding friend:', err);
      throw err;
    }
  }

  async removeFriend(userId: string, friendId: string) {
    const query = `UPDATE xelyra.users SET friends=friends - [?] WHERE id = ?`;
    const params = [friendId, userId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error removing friend:', err);
      throw err;
    }
  }

  async sendRequest(senderId: string, recieverId: string) {
    const query = `INSERT INTO xelyra.requests (reciever_id, sender_id) VALUES (?, ?)`;
    const params = [recieverId, senderId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error sending request:', err);
      throw err;
    }
  }

  async appendRequestSent(senderId: string, recieverId: string) {
    const query = `INSERT INTO xelyra.requests_sent (sender_id, reciever_id) VALUES (?, ?)`;
    const params = [senderId, recieverId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error appending request sent:', err);
      throw err;
    }
  }

  async removeRequestSent(senderId: string, recieverId: string) {
    const query = `DELETE FROM xelyra.requests_sent WHERE sender_id = ? AND reciever_id = ?`;
    const params = [senderId, recieverId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error removing request sent:', err);
      throw err;
    }
  }

  async removeRequest(senderId: string, recieverId: string) {
    const query = `DELETE FROM xelyra.requests WHERE reciever_id = ? AND sender_id = ?`;
    const params = [recieverId, senderId];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      console.error('Error removing request:', err);
      throw err;
    }
  }

  async alreadyFriends(userId: string, friendId: string) {
    const user = await this.findById(userId);
    if (user.length === 0) return false;
    return Array.isArray(user[0].friends) && user[0].friends.includes(friendId);
  }

  async getRequestsByRecieverId(recieverId: string): Promise<string[]> {
    const query = `SELECT sender_id FROM xelyra.requests WHERE reciever_id = ?`;
    const results = await this.scyllaService.execute(query, [recieverId]);
    return results.rows ? results.rows.map((row) => row.sender_id) : [];
  }

  async getRequestsSentBySenderId(senderId: string): Promise<string[]> {
    const query = `SELECT reciever_id FROM xelyra.requests_sent WHERE sender_id = ?`;
    const results = await this.scyllaService.execute(query, [senderId]);
    return results.rows ? results.rows.map((row) => row.reciever_id) : [];
  }

  async updateBannerTheme(
    id: string,
    banner: string | null,
    primary_theme?: string,
    secondary_theme?: string,
  ) {
    const query = `UPDATE xelyra.users SET banner = ?, primary_theme = ?, secondary_theme = ? WHERE id = ?`;
    const params = [banner, primary_theme, secondary_theme, id];
    try {
      const results = await this.scyllaService.execute(query, params);
      return results.rows;
    } catch (err) {
      throw err;
    }
  }
}
