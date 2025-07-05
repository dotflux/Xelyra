import { Module } from '@nestjs/common';
import { ScyllaModule } from 'src/db/scylla.module';
import { BotsService } from 'src/services/bots.service';

@Module({
  imports: [ScyllaModule],
  providers: [BotsService],
  exports: [BotsService],
})
export class BotsModule {}
