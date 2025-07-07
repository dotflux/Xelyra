import { Module } from '@nestjs/common';
import { GenAIService } from '../services/genai.service';
import { GenAiController } from '../controllers/genai.controller';
import { UsersModule } from './users.module';
import { MessagesModule } from './messages.module';
import { ConversationsModule } from './conversations.module';
import { GroupsModule } from './groups.module';
import { ChannelsModule } from './channels.module';
import { GenAIImageService } from '../services/genaiImage.service';
import { MessagesGatewayModule } from './msgGateway.module';

@Module({
  imports: [
    UsersModule,
    MessagesModule,
    ConversationsModule,
    GroupsModule,
    ChannelsModule,
    MessagesGatewayModule,
  ],
  providers: [GenAIService, GenAIImageService],
  controllers: [GenAiController],
  exports: [GenAIService, GenAIImageService],
})
export class GenAIModule {}
