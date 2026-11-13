import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:5174')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({ origin: origins });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('v1', {
    exclude: ['/'],
  });

  const openApiConfig = new DocumentBuilder()
    .setTitle('PulseFit Core API')
    .setDescription('Core service REST API for PulseFit domain modules.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const openApiDocument = SwaggerModule.createDocument(app, openApiConfig, {
    ignoreGlobalPrefix: false,
  });
  SwaggerModule.setup('v1/docs', app, openApiDocument, {
    jsonDocumentUrl: 'v1/openapi.json',
  });

  await app.listen(Number(process.env.PORT ?? 3000));
}

bootstrap();
