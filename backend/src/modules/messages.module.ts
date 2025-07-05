import { Module } from '@nestjs/common';
import { ScyllaModule } from 'src/db/scylla.module';
import { MessagesService } from 'src/services/messages.service';

@Module({
  imports: [ScyllaModule],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
