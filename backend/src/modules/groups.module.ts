import { Module } from '@nestjs/common';
import { ScyllaModule } from 'src/db/scylla.module';
import { GroupsService } from 'src/services/groups.service';

@Module({
  imports: [ScyllaModule],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
