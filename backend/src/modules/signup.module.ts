import { Module } from '@nestjs/common';
import { SignupController } from 'src/controllers/signup.controller';
import { SignupService } from 'src/services/signup.service';
import { DummyUsersModule } from './dummyUsers.module';
import { UsersModule } from './users.module';

@Module({
  imports: [DummyUsersModule, UsersModule],
  controllers: [SignupController],
  providers: [SignupService],
})
export class SignupModule {}
