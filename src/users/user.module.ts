import { DatabaseModule } from '@@common/database/database.module';
import { Module } from '@nestjs/common';
import { CoreUserService } from './user.service';

@Module({
  imports:[DatabaseModule],
  providers: [CoreUserService],
  exports: [CoreUserService],
})
export class CoreUserModule {}
