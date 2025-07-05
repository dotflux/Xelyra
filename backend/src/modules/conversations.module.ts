import { Module } from '@nestjs/common';
import { ScyllaModule } from 'src/db/scylla.module';
import { ConversationsService } from 'src/services/conversations.service';

@Module({
  imports: [ScyllaModule],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
