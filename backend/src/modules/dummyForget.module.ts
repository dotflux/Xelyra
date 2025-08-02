import { Module } from '@nestjs/common';
import { DummyForgetService } from 'src/services/dummyForget.service';
import { ScyllaModule } from 'src/db/scylla.module';

@Module({
  imports: [ScyllaModule],
  providers: [DummyForgetService],
  exports: [DummyForgetService],
})
export class DummyForgetModule {}
