import { Module } from '@nestjs/common';
import { ScyllaModule } from 'src/db/scylla.module';
import { ServerAppsService } from 'src/services/serverApps.service';

@Module({
  imports: [ScyllaModule],
  providers: [ServerAppsService],
  exports: [ServerAppsService],
})
export class ServerAppsModule {}
