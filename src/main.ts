import { ErrorsInterceptor } from '@@common/interceptors/errors.interceptor';
import { RequestInterceptor } from '@@common/interceptors/request.interceptor';
import { ResponseInterceptor } from '@@common/interceptors/response.interceptor';
import {
  BadRequestException,
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  const appPort = configService.get('app.port');
  const appHost = [];
  appHost.push(configService.get('app.host'));
  const appName = configService.get('app.name');
  const appVersion = configService.get('app.version');
  const appDescription = configService.get('app.desciption');

  const initSwagger = (
    app: INestApplication,
    {
      appHost,
      appName,
      appVersion,
      appDescription,
    }: {
      appHost: string[];
      appName: string;
      appVersion: string;
      appDescription: string;
    },
  ) => {
    const config = new DocumentBuilder()
      .setTitle(appName)
      .setDescription(appDescription)
      .setVersion(appVersion)
      .addBearerAuth();

    appHost.forEach((appHost) => {
      config.addServer(appHost);
    });

    const document = SwaggerModule.createDocument(app, config.build());

    SwaggerModule.setup('/swagger', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  };

  initSwagger(app, { appDescription, appHost, appName, appVersion });

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

  await app.listen(appPort);
}
bootstrap();
