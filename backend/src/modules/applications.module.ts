import { Module } from '@nestjs/common';
import { ScyllaModule } from 'src/db/scylla.module';
import { ApplicationsService } from 'src/services/applications.service';

@Module({
  imports: [ScyllaModule],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
