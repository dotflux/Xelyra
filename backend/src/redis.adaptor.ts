import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = new Redis({ host: '172.31.44.255', port: 6379 });
    const subClient = pubClient.duplicate();

    // Wait for both to be ready
    await Promise.all([
      new Promise((res) => pubClient.once('ready', res)),
      new Promise((res) => subClient.once('ready', res)),
    ]);

    // Build the Socket.IO adapter
    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
