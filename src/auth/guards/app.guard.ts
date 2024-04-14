import {
  AUTH_STRATEGY_KEY,
  AuthStrategyMetadata,
} from '@@auth/decorators/auth-strategy.decorator';
import { AuthStrategyType } from '@@auth/interfaces';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import jwtDecode from 'jwt-decode';

@Injectable()
export class AppGuard extends AuthGuard(['jwt']) {
  constructor(protected reflector: Reflector) {
    super(reflector);
  }

  canActivate(context: ExecutionContext) {
    const [authStrategy, authGroups] =
      this.reflector.getAllAndOverride<AuthStrategyMetadata>(
        AUTH_STRATEGY_KEY,
        [context.getHandler(), context.getClass()],
      ) || [];
    if (authStrategy?.includes(AuthStrategyType.PUBLIC)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authTokenType = this.getAuthTokenType(request);
    if (!authStrategy?.includes(authTokenType)) {
      return false;
    }

    request._authGroups = authGroups || [];

    return super.canActivate(context);
  }

  private getAuthTokenType(req: Request): AuthStrategyType | undefined {
    const authToken = String(req.header('authorization'));

    try {
      return !req.query?.access_token && jwtDecode(authToken.split(/\s+/)[1])
        ? AuthStrategyType.BEARER
        : undefined;
    } catch (e) {
      return;
    }
  }
}
