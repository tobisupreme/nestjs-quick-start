import { ErrorsInterceptor } from '@@common/interceptors/errors.interceptor';
import { RequestInterceptor } from '@@common/interceptors/request.interceptor';
import { ResponseInterceptor } from '@@common/interceptors/response.interceptor';
import { initSwagger } from '@@common/swagger';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  const appPort = configService.get('app.port');
  const appName = configService.get('app.name');
  const appVersion = configService.get('app.version');
  const appDescription = configService.get('app.desciption');
  const corsOptions = configService.get('cors');

  initSwagger(app, {
    appDescription,
    appHost: [{ url: configService.get('app.host') }],
    appName,
    appVersion,
  });

  app.useGlobalInterceptors(
    new RequestInterceptor(),
    new ResponseInterceptor(),
    new ErrorsInterceptor(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: {
        target: false,
        value: false,
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) =>
        new BadRequestException(
          validationErrors.reduce(
            (errorObj, validationList) => ({
              ...errorObj,
              [validationList.property]: validationList,
            }),
            {},
          ),
        ),
    }),
  );

  app.enableCors(corsOptions);

  await app.listen(appPort);
}
bootstrap();
