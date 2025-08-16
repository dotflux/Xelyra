import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Client, types } from 'cassandra-driver';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class ScyllaService implements OnModuleDestroy {
  private client: Client;

  constructor() {
    this.client = new Client({
      contactPoints:
        process.env.CURRENT_ENV === 'docker' ? ['scylla'] : ['127.0.0.1'],
      localDataCenter: 'datacenter1',
      keyspace: 'xelyra',
      pooling: {
        coreConnectionsPerHost: {
          [types.distance.local]: 4, // increased for more concurrency
          [types.distance.remote]: 2,
        },
        maxRequestsPerConnection: 2048, // doubled from default
      },
    });
  }

  async execute(query: string, params?: any[], options: any = {}) {
    return await this.client.execute(query, params, {
      prepare: true,
      ...options,
    });
  }

  async onModuleDestroy() {
    await this.client.shutdown();
  }
}
