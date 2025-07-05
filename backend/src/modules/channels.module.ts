import { Module } from '@nestjs/common';
import { ScyllaModule } from 'src/db/scylla.module';
import { ChannelsService } from 'src/services/channels.service';

@Module({
  imports: [ScyllaModule],
  providers: [ChannelsService],
  exports: [ChannelsService],
})
export class ChannelsModule {}
