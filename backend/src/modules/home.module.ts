import { Module } from '@nestjs/common';
import { HomeService } from 'src/services/home.service';
import { HomeController } from 'src/controllers/home.controller';
import { UsersModule } from './users.module';
import { ConversationsModule } from './conversations.module';
import { GroupsModule } from './groups.module';
import { ServersModule } from './servers.module';

@Module({
  imports: [UsersModule, ConversationsModule, GroupsModule, ServersModule],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
