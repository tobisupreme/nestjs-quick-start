import { AuthStrategyType } from '@@auth/interfaces';
import { SetMetadata } from '@nestjs/common';

export const AUTH_STRATEGY_KEY = '$__authStrategyKey';

export const AuthStrategy = (
  strategy: AuthStrategyType[] = [AuthStrategyType.BEARER],
  authGroups?: string[],
) => SetMetadata(AUTH_STRATEGY_KEY, [strategy, authGroups]);

export type AuthStrategyMetadata = [AuthStrategyType[], string[]];
