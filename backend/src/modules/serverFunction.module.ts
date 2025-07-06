import { Module } from '@nestjs/common';
import { ServersFunctionService } from 'src/services/serversFunction.service';
import { UsersModule } from './users.module';
import { MessagesModule } from './messages.module';
import { MessagesGatewayModule } from './msgGateway.module';
import { ServerController } from 'src/controllers/servers.controller';
import { ServersModule } from './servers.module';
import { ServerMembersModule } from './serverMembers.module';
import { ChannelsModule } from './channels.module';
import { RolesModule } from './roles.module';
import { UserPermissionsModule } from './userPermissions.module';
import { ChannelOverwritesModule } from './channelOverwrites.module';
import { PermissionsModule } from './permissions.module';

@Module({
  imports: [
    UsersModule,
    MessagesModule,
    MessagesGatewayModule,
    ServersModule,
    ServerMembersModule,
    ChannelsModule,
    RolesModule,
    UserPermissionsModule,
    ChannelOverwritesModule,
    PermissionsModule,
  ],
  controllers: [ServerController],
  providers: [ServersFunctionService],
})
export class ServersFunctionModule {}
