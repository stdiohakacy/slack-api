import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestApplication } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { ENUM_AUTH_SRV_APP_ENVIRONMENT } from 'src/app/enums/app.enum';

export default async function (app: NestApplication) {
  const configService = app.get(ConfigService);
  const env = configService.get<string>('app.env');

  const docName: string = configService.get<string>('doc.name');
  const docDesc: string = configService.get<string>('doc.description');
  const docVersion: string = configService.get<string>('app.version');
  const docPrefix: string = configService.get<string>('doc.prefix');

  if (env !== ENUM_AUTH_SRV_APP_ENVIRONMENT.PRODUCTION) {
    const documentBuild = new DocumentBuilder()
      .setTitle(docName)
      .setDescription(docDesc)
      .setVersion(docVersion)
      .addServer('/')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'accessToken',
      )
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'refreshToken',
      )
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'google',
      )
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'apple',
      )
      //   .addApiKey({ type: 'apiKey', in: 'header', name: 'x-api-key' }, 'xApiKey')
      .build();

    const document = SwaggerModule.createDocument(app, documentBuild, {
      deepScanRoutes: true,
    });

    writeFileSync('swagger.json', JSON.stringify(document));
    SwaggerModule.setup(docPrefix, app, document, {
      jsonDocumentUrl: `${docPrefix}/json`,
      yamlDocumentUrl: `${docPrefix}/yaml`,
      explorer: true,
      customSiteTitle: docName,
      swaggerOptions: {
        docExpansion: 'none',
        persistAuthorization: true,
        displayOperationId: true,
        operationsSorter: 'method',
        tagsSorter: 'alpha',
        tryItOutEnabled: true,
        filter: true,
        deepLinking: true,
      },
    });

    console.log(
      `Docs will serve on http://0.0.0.0:3000${docPrefix}`,
      'NestApplication',
    );
  }
}
