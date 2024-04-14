import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaClientManager } from './prisma-client-manager';
import { PrismaService } from './prisma/prisma.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaClient, PrismaService, PrismaClientManager],
  exports: [PrismaClient, PrismaService, PrismaClientManager],
})
export class DatabaseModule {}
