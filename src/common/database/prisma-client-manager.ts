import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaClientManager implements OnModuleDestroy {
  private prismaClient: PrismaClient = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  getPrismaClient(): PrismaClient {
    return this.prismaClient;
  }

  async onModuleDestroy() {
    await this.prismaClient.$disconnect();
  }
}
