import { Module } from '@nestjs/common';
import { DeveloperService } from 'src/services/developer.service';
import { UsersModule } from './users.module';
import { MessagesModule } from './messages.module';
import { MessagesGatewayModule } from './msgGateway.module';
import { DeveloperController } from 'src/controllers/developer.controller';
import { ServersModule } from './servers.module';
import { ServerMembersModule } from './serverMembers.module';
import { ChannelsModule } from './channels.module';
import { RolesModule } from './roles.module';
import { UserPermissionsModule } from './userPermissions.module';
import { ChannelOverwritesModule } from './channelOverwrites.module';
import { PermissionsModule } from './permissions.module';
import { ApplicationsModule } from './applications.module';
import { BotsModule } from './bots.module';
import { SlashCommandsModule } from './slashCommands.module';
import { BotsGatewayModule } from './botsGateway.module';
import { ServerAppsModule } from './serverApps.module';

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
    ApplicationsModule,
    BotsModule,
    SlashCommandsModule,
    BotsGatewayModule,
    ServerAppsModule,
  ],
  controllers: [DeveloperController],
  providers: [DeveloperService],
})
export class DeveloperModule {}
