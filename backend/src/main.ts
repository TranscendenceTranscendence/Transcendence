// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);
//   app.useGlobalPipes(
//     new ValidationPipe({ whitelist: true }),
//   );
//   app.enableCors({
//     origin: '*', // Replace with your frontend origin for production
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
//     credentials: true,
// });
//   await app.listen(3000);
// }
// bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as fs from 'fs';
import * as cookieParser from 'cookie-parser';
import jwtConfig from './auth/config/jwt.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

const httpsOptions = {
  key: fs.readFileSync('./secrets/cert-key.pem'),
  cert: fs.readFileSync('./secrets/cert.pem'),
};


const setupSwagger = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Transcendence backend')
    .setDescription('The Transcendence API description')
    .setVersion('1.0')
    .addServer('https://localhost:3000')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  // Modify the operationId globally
  for (const path in document.paths) {
    for (const method in document.paths[path]) {
      const operation = document.paths[path][method];
      console.log(operation);
      operation.operationId = operation.operationId.replace('Controller', '');
    }
  }

  
  fs.writeFileSync('./openapi.json', JSON.stringify(document));

  SwaggerModule.setup('api-docs', app, document);
}


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {httpsOptions});

  setupSwagger(app);

  app.use(cookieParser(jwtConfig().secret.toString()));

  app.enableCors({
    origin: [
      process.env.FRONTEND_ORIGIN || 'http://localhost:3001',
    ], // Replace with your frontend origin for production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });


  await app.listen(3000);
}
bootstrap();