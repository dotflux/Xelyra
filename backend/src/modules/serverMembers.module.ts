import { Module } from '@nestjs/common';
import { ScyllaModule } from 'src/db/scylla.module';
import { ServerMembersService } from 'src/services/serverMembers.service';

@Module({
  imports: [ScyllaModule],
  providers: [ServerMembersService],
  exports: [ServerMembersService],
})
export class ServerMembersModule {}
