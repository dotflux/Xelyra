import { Module } from '@nestjs/common';
import { LoginController } from 'src/controllers/login.controller';
import { LoginService } from 'src/services/login.service';
import { UsersModule } from './users.module';

@Module({
  imports: [UsersModule],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
