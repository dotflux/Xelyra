import { Module } from '@nestjs/common';
import { ScyllaModule } from 'src/db/scylla.module';
import { ServersService } from 'src/services/servers.service';

@Module({
  imports: [ScyllaModule],
  providers: [ServersService],
  exports: [ServersService],
})
export class ServersModule {}
