import { Module } from '@nestjs/common';
import { ScyllaService } from './scylla.service';
import { CqlLoaderService } from './cql_loader.service';

@Module({
  providers: [ScyllaService, CqlLoaderService],
  exports: [ScyllaService],
})
export class ScyllaModule {}
