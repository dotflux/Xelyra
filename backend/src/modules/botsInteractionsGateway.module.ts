import { Module } from '@nestjs/common';
import { BotsGatewayModule } from './botsGateway.module';
import { BotsInteractionsGateway } from 'src/gateways/botsInteractions.gateway';

@Module({
  imports: [BotsGatewayModule],
  exports: [BotsInteractionsGateway],
  providers: [BotsInteractionsGateway],
})
export class BotsInteractionsGatewayModule {}
