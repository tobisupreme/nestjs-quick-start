import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Global, Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheService } from './cache.service';

@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('CacheModule');

        try {
          return {
            store: await redisStore({
              url: configService.get<string>('redis.url'),
              ttl: configService.get<number>('redis.cacheTtl'),
            }),
          };
        } catch (error) {
          if (error.code === 'ECONNREFUSED') {
            logger.error(
              'Failed to connect to Redis: Connection refused. Please make sure the Redis server is running.',
            );
          } else {
            logger.error(
              `An error occurred while setting up Redis cache: ${error.message}`,
            );
          }
          throw error; // Re-throw the error after logging it
        }
      },
      isGlobal: true,
      inject: [ConfigService],
    }),
  ],
})
export class CacheModule {}
