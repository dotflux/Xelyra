import { Module } from '@nestjs/common';
import { ScyllaModule } from './db/scylla.module';
import { UsersModule } from './modules/users.module';
import { DummyUsersModule } from './modules/dummyUsers.module';
import { SignupModule } from './modules/signup.module';
import { LoginModule } from './modules/login.module';
import { ConversationsModule } from './modules/conversations.module';
import { GroupsModule } from './modules/groups.module';
import { ServersModule } from './modules/servers.module';
import { HomeModule } from './modules/home.module';
import { ChannelsModule } from './modules/channels.module';
import { ServerMembersModule } from './modules/serverMembers.module';
import { MessagesGatewayModule } from './modules/msgGateway.module';
import { MessagesModule } from './modules/messages.module';
import { ApplicationsModule } from './modules/applications.module';
import { BotsModule } from './modules/bots.module';
import { ServersFunctionModule } from './modules/serverFunction.module';
import { RolesModule } from './modules/roles.module';
import { UserPermissionsModule } from './modules/userPermissions.module';
import { ChannelOverwritesModule } from './modules/channelOverwrites.module';
import { PermissionsModule } from './modules/permissions.module';
import { SlashCommandsModule } from './modules/slashCommands.module';
import { ServerAppsModule } from './modules/serverApps.module';
import { BotsGatewayModule } from './modules/botsGateway.module';
import { DeveloperModule } from './modules/developer.module';
import { GenAIModule } from './modules/genai.module';
import { MetricsController } from './controllers/metrics.controller';
import { BotsInteractionsGatewayModule } from './modules/botsInteractionsGateway.module';

@Module({
  imports: [
    ScyllaModule,
    UsersModule,
    DummyUsersModule,
    SignupModule,
    LoginModule,
    ConversationsModule,
    GroupsModule,
    ServersModule,
    HomeModule,
    ChannelsModule,
    ServerMembersModule,
    MessagesGatewayModule,
    MessagesModule,
    ApplicationsModule,
    BotsModule,
    ServersFunctionModule,
    RolesModule,
    UserPermissionsModule,
    ChannelOverwritesModule,
    PermissionsModule,
    SlashCommandsModule,
    ServerAppsModule,
    BotsGatewayModule,
    DeveloperModule,
    GenAIModule,
    BotsInteractionsGatewayModule,
  ],
  controllers: [MetricsController],
})
export class AppModule {}
