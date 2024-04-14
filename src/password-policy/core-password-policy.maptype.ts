import { CrudMapType } from '@@/common/interfaces/crud-map-type.interface';
import { Prisma } from '@prisma/client';

export class CorePasswordPolicyMapType implements CrudMapType {
  aggregate: Prisma.PasswordPolicyAggregateArgs;
  count: Prisma.PasswordPolicyCountArgs;
  create: Prisma.PasswordPolicyCreateArgs;
  delete: Prisma.PasswordPolicyDeleteArgs;
  deleteMany: Prisma.PasswordPolicyDeleteManyArgs;
  findFirst: Prisma.PasswordPolicyFindFirstArgs;
  findMany: Prisma.PasswordPolicyFindManyArgs;
  findUnique: Prisma.PasswordPolicyFindUniqueArgs;
  update: Prisma.PasswordPolicyUpdateArgs;
  updateMany: Prisma.PasswordPolicyUpdateManyArgs;
  upsert: Prisma.PasswordPolicyUpsertArgs;
}
