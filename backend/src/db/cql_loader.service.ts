import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client } from 'cassandra-driver';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CqlLoaderService implements OnModuleInit {
  private readonly logger = new Logger(CqlLoaderService.name);
  private readonly client = new Client({
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
  });

  async onModuleInit() {
    const migrationsPath = path.resolve(process.cwd(), 'src/db/cql_scripts');
    this.logger.log(`Loading CQL scripts from: ${migrationsPath}`);

    const files = fs.readdirSync(migrationsPath).sort();

    for (const file of files) {
      const filePath = path.join(migrationsPath, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // Split on semicolon, ignore empty/whitespace-only statements
      const statements = content
        .split(';')
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0);

      try {
        this.logger.log(
          `Running ${file} (${statements.length} statement(s))...`,
        );
        for (const stmt of statements) {
          await this.client.execute(stmt);
        }
        this.logger.log(`✔ Executed ${file}`);
      } catch (error) {
        this.logger.error(`✖ Error in ${file}: ${error.message}`);
      }
    }
  }
}
