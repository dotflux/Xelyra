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
  ],
})
export class AppModule {}
