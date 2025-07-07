import { Module } from '@nestjs/common';
import { SignupController } from 'src/controllers/signup.controller';
import { SignupService } from 'src/services/signup.service';
import { DummyUsersModule } from './dummyUsers.module';
import { UsersModule } from './users.module';
import { ConversationsModule } from './conversations.module';

@Module({
  imports: [DummyUsersModule, UsersModule, ConversationsModule],
  controllers: [SignupController],
  providers: [SignupService],
})
export class SignupModule {}
