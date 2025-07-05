import { Module } from '@nestjs/common';
import { HomeService } from 'src/services/home.service';
import { HomeController } from 'src/controllers/home.controller';
import { UsersModule } from './users.module';
import { ConversationsModule } from './conversations.module';
import { GroupsModule } from './groups.module';
import { ServersModule } from './servers.module';
import { MessagesModule } from './messages.module';
import { ChannelsModule } from './channels.module';
import { BotsModule } from './bots.module';
import { ApplicationsModule } from './applications.module';
import { ServerMembersModule } from './serverMembers.module';
import { MessagesGatewayModule } from './msgGateway.module';

@Module({
  imports: [
    UsersModule,
    ConversationsModule,
    GroupsModule,
    ServersModule,
    MessagesModule,
    ChannelsModule,
    BotsModule,
    ApplicationsModule,
    ServerMembersModule,
    MessagesGatewayModule,
  ],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
