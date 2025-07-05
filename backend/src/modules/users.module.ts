import { Module } from '@nestjs/common';
import { ScyllaModule } from 'src/db/scylla.module';
import { UsersService } from 'src/services/users.service';
@Module({
  imports: [ScyllaModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
