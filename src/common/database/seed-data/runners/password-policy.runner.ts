import { SeedRunner } from '@@common/interfaces';
import { PrismaClient } from '@prisma/client';
import { corePasswordPolicySeed } from '../core-password-policy.seed';

export default class CorePasswordPolicyRunner extends SeedRunner {
  constructor(private prismaClient: PrismaClient) {
    super();
  }

  async run(): Promise<any> {
    const { id, ...data } = corePasswordPolicySeed;
    return Promise.all([
      this.prismaClient.passwordPolicy.upsert({
        where: { id },
        update: { ...data },
        create: { id, ...data },
      }),
    ]);
  }
}
