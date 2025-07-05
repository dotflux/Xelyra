import { Module } from '@nestjs/common';
import { ScyllaModule } from './db/scylla.module';
import { UsersModule } from './modules/users.module';
import { DummyUsersModule } from './modules/dummyUsers.module';
import { SignupModule } from './modules/signup.module';
import { LoginModule } from './modules/login.module';

@Module({
  imports: [
    ScyllaModule,
    UsersModule,
    DummyUsersModule,
    SignupModule,
    LoginModule,
  ],
})
export class AppModule {}
