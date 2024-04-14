import { AuthModule } from '@@auth/auth.module';
import { JwtStrategy } from '@@auth/strategy/jwt.strategy';
import { CacheModule } from '@@common/cache/cache.module';
import { DatabaseModule } from '@@common/database/database.module';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import appConfig from './app.config';
import { CoreUserModule } from './users/user.module';

@Global()
@Module({
  imports: [
    AuthModule,
    CacheModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      expandVariables: true,
    }),
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        configService.get('jwt'),
      inject: [ConfigService],
    }),
    CoreUserModule,
  ],
  controllers: [],
  providers: [JwtStrategy],
})
export class AppModule {}
