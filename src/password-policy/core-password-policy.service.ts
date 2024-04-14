import { PasswordStrengthMapper } from '@@common/constants';
import { CrudService } from '@@common/database/crud.service';
import { RequestWithUser } from '@@common/interfaces';
import { Injectable, NotAcceptableException } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { passwordStrength } from 'check-password-strength';
import moment from 'moment';
import { AppUtilities } from 'src/app.utilities';
import { CorePasswordPolicyMapType } from './core-password-policy.maptype';
import { UpdatePasswordPolicyDto } from './dto/update-password-policy.dto';

@Injectable()
export class CorePasswordPolicyService extends CrudService<
  Prisma.PasswordPolicyDelegate,
  CorePasswordPolicyMapType
> {
  constructor(private prismaClient: PrismaClient) {
    super(prismaClient.passwordPolicy);
  }

  async updatePasswordPolicy(
    id: number,
    { lockDuration, ...dto }: UpdatePasswordPolicyDto,
    authUser: RequestWithUser,
  ) {
    const args: Prisma.PasswordPolicyUpdateArgs = {
      where: { id },
      data: {
        ...dto,
        ...(lockDuration && {
          lockDuration: moment.duration(lockDuration, 'm').toISOString(),
        }),
        updatedBy: authUser.user.userId,
      },
    };

    return await this.prismaClient.passwordPolicy.update(args);
  }

  async validateLoginPassword(
    rawPassword: string,
    user: {
      id: number;
      password: string;
      passwordHistory: string[];
      passwordLockedAt: Date;
      passwordUpdatedAt: Date;
      passwordAttempt: number;
    },
  ) {
    const passwordPolicy = await this.prismaClient.passwordPolicy.findFirst({});

    if (passwordPolicy && passwordPolicy.enforcePolicy) {
      const { lockDuration, expiryDuration, allowedAttempts } = passwordPolicy;
      if (user.passwordLockedAt) {
        const lockPeriod = moment.duration(lockDuration, 'm');
        const unlockTime = moment(user.passwordLockedAt).add(lockPeriod);

        if (moment().isBefore(unlockTime)) {
          throw new NotAcceptableException(
            `Account is locked for ${unlockTime.fromNow(true)}!`,
          );
        }
      }

      if (user.passwordUpdatedAt) {
        const passwordExpiryDate = moment(user.passwordUpdatedAt).add(
          expiryDuration,
          'days',
        );
        if (moment().isAfter(passwordExpiryDate)) {
          throw new NotAcceptableException(`Password is expired!`);
        }
      }

      if (user.passwordAttempt >= allowedAttempts) {
        await this.prismaClient.user.update({
          where: { id: user.id },
          data: {
            passwordAttempt: 0,
            passwordLockedAt: moment().toDate(),
            updatedBy: user.id,
          },
        });
        throw new NotAcceptableException(
          `Password attempts exceeded. Try again in ${moment
            .duration(lockDuration, 'm')
            .humanize()}!`,
        );
      }
    }

    const isMatch = await AppUtilities.validatePassword(
      rawPassword,
      user.password,
    );
    if (!isMatch) {
      await this.prismaClient.user.update({
        where: { id: user.id },
        data: {
          passwordAttempt: { increment: 1 },
          updatedBy: user.id,
        },
      });
    }
    return isMatch;
  }

  async validateChangePassword(
    newPassword: string,
    hashedNewPassword: string,
    user: {
      id: number;
      passwordHistory: string[];
      passwordUpdatedAt: Date;
    },
    authUser: RequestWithUser,
  ) {
    const passwordPolicy = await this.prismaClient.passwordPolicy.findFirst({});
    if (passwordPolicy && passwordPolicy.enforcePolicy) {
      const {
        minPasswordAge,
        passwordHistoryLength,
        minPasswordLength,
        strength,
      } = passwordPolicy;

      if (newPassword.length < minPasswordLength) {
        throw new NotAcceptableException(
          `Minimum length of password should be ${minPasswordLength}!`,
        );
      }

      if (user.passwordUpdatedAt) {
        const nextPasswordUpdateStart = moment(user.passwordUpdatedAt).add(
          minPasswordAge,
          'days',
        );

        if (moment().isBefore(nextPasswordUpdateStart)) {
          throw new NotAcceptableException(
            `Password can only be updated from ${nextPasswordUpdateStart.toString()}!`,
          );
        }
      }

      if (user.passwordHistory) {
        const passwordHistory = user.passwordHistory || [];

        const matches = await Promise.all(
          passwordHistory.map((pwd) => {
            return AppUtilities.validatePassword(newPassword, pwd);
          }),
        );
        if (matches.includes(true)) {
          throw new NotAcceptableException(`Password has been used!`);
        }
      }

      const pwdStrengthVal = passwordStrength(newPassword)?.id;
      const policyPwdStrength = PasswordStrengthMapper[strength];
      if (policyPwdStrength > pwdStrengthVal) {
        throw new NotAcceptableException(`Password is weak!`);
      }

      let passwordHistory = user.passwordHistory || [];
      passwordHistory.push(hashedNewPassword);
      if (passwordHistory.length > passwordHistoryLength) {
        passwordHistory = passwordHistory.slice(
          passwordHistory.length - passwordHistoryLength,
        );
      }
      await this.prismaClient.user.update({
        where: { id: user.id },
        data: {
          passwordHistory,
          updatedBy: authUser.user.userId,
        },
      });
    }
  }
}
