import { Module } from '@nestjs/common';
import { MessagesGateway } from 'src/gateways/messages.gateway';

@Module({
  exports: [MessagesGateway],
  providers: [MessagesGateway],
})
export class MessagesGatewayModule {}
