import { CorePasswordPolicyModule } from '@@/password-policy/core-password-policy.module';
import { CoreUserModule } from '@@/users/user.module';
import { AuthController } from '@@auth/auth.controller';
import { AuthService } from '@@auth/auth.service';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [CorePasswordPolicyModule, CoreUserModule, JwtModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
