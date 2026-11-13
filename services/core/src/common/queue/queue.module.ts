import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobMetadata } from '../database';
import { JobQueueService } from './job-queue.service';
import { PLATFORM_QUEUE } from './queue.constants';
import { SampleJobProcessor } from './sample-job.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
        password: process.env.REDIS_PASSWORD || undefined,
      },
      defaultJobOptions: {
        backoff: {
          delay: Number(process.env.QUEUE_RETRY_DELAY_MS ?? 5000),
          type: 'exponential',
        },
      },
    }),
    BullModule.registerQueue({
      name: PLATFORM_QUEUE,
    }),
    TypeOrmModule.forFeature([JobMetadata]),
  ],
  providers: [JobQueueService, SampleJobProcessor],
  exports: [JobQueueService],
})
export class QueueModule {}
