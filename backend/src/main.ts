import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Transcendence backend')
    .setDescription('The Transcendence API description')
    .setVersion('1.0')
    .addServer(process.env.BACKEND_URL)
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      in: 'header',
      name: 'Authorization',
      bearerFormat: 'JWT',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      controllerKey + methodKey[0].toUpperCase() + methodKey.slice(1),
  });

  fs.writeFileSync('./openapi.json', JSON.stringify(document));

  SwaggerModule.setup('api-docs', app, document);
};

(async () => {
  const httpsOptions = {
    key: fs.readFileSync('./secrets/cert-key.pem'),
    cert: fs.readFileSync('./secrets/cert.pem'),
  };
  const app: NestExpressApplication = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  setupSwagger(app);

  // app.use(cookieParser("secret"));

  app.enableCors({
    origin: [process.env.FRONTEND_URL ?? 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useStaticAssets('uploads', {
    prefix: '/uploads/',
  });
  app.useStaticAssets('img', {
    prefix: '/img/',
  });

  await app.listen(3000);

  console.info(
    `Swagger documentation available at https://localhost:3000/api-docs`,
  );
  console.log(
    `listening on ${process.env.BACKEND_URL || 'http://localhost:3001'}`,
  );
})();
