import { Module } from '@nestjs/common';
import { CorePasswordPolicyService } from './core-password-policy.service';
import { CorePasswordPolicyController } from './core-password-policy.controller';

@Module({
  providers: [CorePasswordPolicyService],
  controllers: [CorePasswordPolicyController],
  exports: [CorePasswordPolicyService],
})
export class CorePasswordPolicyModule {}
