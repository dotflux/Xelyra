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
  ],
})
export class AppModule {}
