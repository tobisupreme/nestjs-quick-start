import { CrudService } from '@@common/database/crud.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { UserMaptype } from './user.maptype';
import { SignUpUserDto } from './dto/create-user.dto';
import { AppUtilities } from '@@/app.utilities';
import { SensitiveUserInfo } from '@@/common/constants';

@Injectable()
export class CoreUserService extends CrudService<
  Prisma.UserDelegate,
  UserMaptype
> {
  constructor(private readonly prismaClient: PrismaClient) {
    super(prismaClient.user);
  }

  async findOne(identity: string, prismaClient?: PrismaClient) {
    prismaClient = prismaClient ?? this.prismaClient;

    return prismaClient.user.findFirst({
      where: { OR: [{ email: identity }, { username: identity }] },
      include: { contact: true },
    });
  }

  async identityExists(identity: string, prismaClient?: PrismaClient) {
    prismaClient = prismaClient ?? this.prismaClient;

    return !!(await prismaClient.user.findFirst({
      where: { OR: [{ username: identity }, { email: identity }] },
    }));
  }

  async setupUser({ userContactInfo, userInfo }: SignUpUserDto) {
    const identityExists = await this.identityExists(userInfo.email);
    if (identityExists)
      throw new BadRequestException('Username or email already exists');

    const { password, ...createUserPayload } = userInfo;
    const hashedPassword = await AppUtilities.hashAuthSecret(password);

    const user = await this.prismaClient.$transaction(
      async (prisma: PrismaClient) => {
        const { id } = await prisma.userContact.create({
          data: { ...userContactInfo },
        });
        return await prisma.user.create({
          data: {
            ...createUserPayload,
            password: hashedPassword,
            contact: { connect: { id } },
          },
          include: { contact: true },
        });
      },
    );

    return AppUtilities.removeSensitiveData(user, SensitiveUserInfo);
  }
}
