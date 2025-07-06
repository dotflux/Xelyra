import { Module } from '@nestjs/common';
import { PermissionsService } from 'src/services/permissions.service';
import { ServerMembersModule } from './serverMembers.module';
import { ChannelOverwritesModule } from 'src/modules/channelOverwrites.module';

@Module({
  imports: [ServerMembersModule, ChannelOverwritesModule],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
