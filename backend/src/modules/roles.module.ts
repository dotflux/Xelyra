import { Module } from '@nestjs/common';
import { ScyllaModule } from 'src/db/scylla.module';
import { RolesService } from 'src/services/roles.service';

@Module({
  imports: [ScyllaModule],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
