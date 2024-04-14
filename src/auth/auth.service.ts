import { CacheService } from '@@common/cache/cache.service';
import { SensitiveUserInfo } from '@@common/constants';
import { PrismaClientManager } from '@@common/database/prisma-client-manager';
import {
  CacheKeysEnums,
  JwtPayload,
  JwtSignPayload,
} from '@@common/interfaces';
import { CorePasswordPolicyService } from '@@password-policy/core-password-policy.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CookieOptions, Response } from 'express';
import moment from 'moment';
import { AppUtilities } from '../app.utilities';
import { CoreUserService } from '../users/user.service';
import { SignInDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private jwtExpires: number;
  private toMilliseconds: (ttl: number) => number;
  private appName: string;

  constructor(
    private cacheService: CacheService,
    private configService: ConfigService,
    private coreUserService: CoreUserService,
    private jwtService: JwtService,
    private passwordPolicyService: CorePasswordPolicyService,
    private prismaClientManager: PrismaClientManager,
  ) {
    this.jwtExpires = this.configService.get<number>(
      'jwt.signOptions.expiresIn',
    );
    this.toMilliseconds = (ttl) => ttl * 1000;
    this.appName = configService.get('app.name');
  }

  async signIn(
    { identity, password }: SignInDto,
    lastLoginIp: string,
    response: Response,
  ) {
    const prismaClient = this.prismaClientManager.getPrismaClient();
    const user = await this.coreUserService.findOne(identity);

    if (
      !user ||
      !(await this.passwordPolicyService.validateLoginPassword(password, {
        id: user.id,
        password: user.password,
        passwordAttempt: user.passwordAttempt,
        passwordHistory: user.passwordHistory as string[],
        passwordLockedAt: user.passwordLockedAt,
        passwordUpdatedAt: user.passwordUpdatedAt,
      }))
    ) {
      throw new UnauthorizedException('Invalid credentials!');
    }

    const payloadToSign: JwtSignPayload = {
      id: user.id,
    };

    const accessToken = this.jwtService.sign(payloadToSign, {
      secret: this.configService.get('jwt.secret'),
      expiresIn: this.jwtExpires,
    });
    const [, , sessionId] = accessToken.split('.');

    const payload: JwtPayload = {
      userId: user.id,
      sessionId,
      email: user.email,
      username: user.username,
    };
    await this.cacheService.set(
      `${CacheKeysEnums(this.appName).TOKENS}:${user.id}:${sessionId}`,
      payload,
      this.toMilliseconds(this.jwtExpires),
    );

    await prismaClient.user.update({
      where: { id: user.id },
      data: {
        updatedBy: user.id,
        lastLogin: moment().format(),
        lastLoginIp,
        passwordAttempt: 0,
      },
    });

    this.setCookies(accessToken, response);
    return {
      accessToken,
      user: AppUtilities.removeSensitiveData(user, SensitiveUserInfo),
    };
  }

  private setCookies(token: string, response: Response) {
    const maxAge = parseInt(process.env.JWT_EXPIRES);
    const expires = new Date(new Date().getTime() + maxAge);
    const cookieOptions: CookieOptions = { maxAge, expires, httpOnly: true };
    response.cookie('access_token', token, cookieOptions);
  }
}
