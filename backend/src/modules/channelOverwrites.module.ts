import { Module } from '@nestjs/common';
import { ScyllaModule } from 'src/db/scylla.module';
import { ChannelOverwritesService } from 'src/services/channelOverwrites.service';

@Module({
  imports: [ScyllaModule],
  providers: [ChannelOverwritesService],
  exports: [ChannelOverwritesService],
})
export class ChannelOverwritesModule {}
