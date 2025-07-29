import { Module } from '@nestjs/common';
import { PermissionsService } from 'src/services/permissions.service';
import { ServerMembersModule } from './serverMembers.module';
import { ChannelOverwritesModule } from 'src/modules/channelOverwrites.module';
import { RolesModule } from 'src/modules/roles.module';

@Module({
  imports: [ServerMembersModule, ChannelOverwritesModule, RolesModule],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
