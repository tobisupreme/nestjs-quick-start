import { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';

export const initSwagger = (
  app: INestApplication,
  {
    appHost,
    appName,
    appVersion,
    appDescription,
  }: {
    appHost: { url: string; description?: string }[];
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

  appHost.forEach(({ url, description }) => {
    config.addServer(url, description);
  });

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}.${methodKey}`,
  };

  const document = SwaggerModule.createDocument(app, config.build(), options);

  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: `${appName} - API Documentation`,
    swaggerOptions: {
      persistAuthorization: true,
    },
  };

  SwaggerModule.setup('/swagger', app, document, customOptions);
};
