import { Module } from '@nestjs/common';
import { ScyllaModule } from 'src/db/scylla.module';
import { UserPermissionsService } from 'src/services/userPermissions.service';

@Module({
  imports: [ScyllaModule],
  providers: [UserPermissionsService],
  exports: [UserPermissionsService],
})
export class UserPermissionsModule {}
