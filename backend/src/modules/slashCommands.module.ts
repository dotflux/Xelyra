import { Module } from '@nestjs/common';
import { ScyllaModule } from 'src/db/scylla.module';
import { SlashCommandsService } from 'src/services/slashCommands.service';

@Module({
  imports: [ScyllaModule],
  providers: [SlashCommandsService],
  exports: [SlashCommandsService],
})
export class SlashCommandsModule {}
