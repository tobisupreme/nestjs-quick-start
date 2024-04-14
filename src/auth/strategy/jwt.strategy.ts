import { CacheService } from '@@common/cache/cache.service';
import {
  CacheKeysEnums,
  JwtSignPayload,
  RequestWithUser,
} from '@@common/interfaces';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private appName: string;
  constructor(
    configService: ConfigService,
    private cacheService: CacheService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.access_token,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
      ]),
      passReqToCallback: true,
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
    this.appName = configService.get('app.name');
  }

  async validate(
    request: Request,
    payload: JwtSignPayload,
  ): Promise<RequestWithUser> {
    let [, token] = String(request.headers['authorization']).split(/\s+/);
    if (!token) {
      token = String(request['query']?.token);
    }
    const [, , sessionKey] = String(token).split('.');
    if (!sessionKey) {
      return undefined;
    }

    const sessionPayload = await this.cacheService.get(
      `${CacheKeysEnums(this.appName).TOKENS}:${payload.id}:${sessionKey}`,
    );

    return sessionPayload;
  }
}
