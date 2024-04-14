import { CrudMapType } from '@@common/interfaces/crud-map-type.interface';
import { Prisma } from '@prisma/client';

export class UserMaptype implements CrudMapType {
  aggregate: Prisma.UserAggregateArgs;
  createMany?: Prisma.UserCreateManyArgs;
  count: Prisma.UserCountArgs;
  create: Prisma.UserCreateArgs;
  delete: Prisma.UserDeleteArgs;
  deleteMany: Prisma.UserDeleteManyArgs;
  findFirst: Prisma.UserFindFirstArgs;
  findMany: Prisma.UserFindManyArgs;
  findUnique: Prisma.UserFindUniqueArgs;
  update: Prisma.UserUpdateArgs;
  updateMany: Prisma.UserUpdateManyArgs;
  upsert: Prisma.UserUpsertArgs;
}
