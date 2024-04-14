import { IsDuration } from '@@/common/decorators/is-duration.decorator';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class UpdatePasswordPolicyDto {
  @IsBoolean()
  @IsOptional()
  enforcePolicy?: boolean;

  @IsOptional()
  @IsNumber()
  minPasswordLength?: number;

  @IsOptional()
  @IsNumber()
  passwordHistoryLength?: number;

  @IsOptional()
  @IsNumber()
  expiryDuration?: number;

  @IsOptional()
  @IsNumber()
  minPasswordAge?: number;

  @IsOptional()
  @IsNumber()
  allowedAttempts?: number;

  @IsDuration({ unit: 'minutes' })
  @IsOptional()
  lockDuration?: string;
}
