import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { QueueModule } from '../src/common/queue';

async function bootstrap() {
  await NestFactory.createApplicationContext(QueueModule);
}

bootstrap();
