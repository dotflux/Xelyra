import { Module } from '@nestjs/common';
import { DummyUsersService } from 'src/services/dummyUsers.service';
import { ScyllaModule } from 'src/db/scylla.module';

@Module({
  imports: [ScyllaModule],
  providers: [DummyUsersService],
  exports: [DummyUsersService],
})
export class DummyUsersModule {}
