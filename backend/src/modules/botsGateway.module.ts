import { Module } from '@nestjs/common';
import { BotsGateway } from 'src/gateways/bots.gateway';
import { MessagesModule } from './messages.module';
import { BotsModule } from './bots.module';
import { MessagesGatewayModule } from './msgGateway.module';
import { SlashCommandsModule } from './slashCommands.module';

@Module({
  imports: [
    MessagesModule,
    BotsModule,
    MessagesGatewayModule,
    SlashCommandsModule,
  ],
  exports: [BotsGateway],
  providers: [BotsGateway],
})
export class BotsGatewayModule {}
