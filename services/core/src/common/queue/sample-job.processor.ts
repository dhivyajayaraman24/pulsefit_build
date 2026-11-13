import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bullmq';
import { Repository } from 'typeorm';
import { JobMetadata } from '../database';
import { PLATFORM_QUEUE, SAMPLE_JOB_NAME } from './queue.constants';
import { QueueJobEnvelope } from './queue.types';

@Processor(PLATFORM_QUEUE)
export class SampleJobProcessor extends WorkerHost {
  constructor(
    @InjectRepository(JobMetadata)
    private readonly jobMetadata: Repository<JobMetadata>,
  ) {
    super();
  }

  async process(job: Job<QueueJobEnvelope>): Promise<void> {
    if (job.name !== SAMPLE_JOB_NAME) {
      return;
    }

    await this.jobMetadata.update(
      {
        queueName: PLATFORM_QUEUE,
        idempotencyKey: job.data.idempotencyKey,
      },
      {
        attemptCount: job.attemptsMade + 1,
        status: 'completed',
        completedAt: new Date(),
      },
    );
  }

  @OnWorkerEvent('active')
  async onActive(job: Job<QueueJobEnvelope>): Promise<void> {
    await this.jobMetadata.update(
      {
        queueName: PLATFORM_QUEUE,
        idempotencyKey: job.data.idempotencyKey,
      },
      {
        attemptCount: job.attemptsMade + 1,
        status: 'active',
      },
    );
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job<QueueJobEnvelope> | undefined, error: Error): Promise<void> {
    if (!job) {
      return;
    }

    const exhausted = job.attemptsMade >= (job.opts.attempts ?? 1);
    await this.jobMetadata.update(
      {
        queueName: PLATFORM_QUEUE,
        idempotencyKey: job.data.idempotencyKey,
      },
      {
        attemptCount: job.attemptsMade,
        deadLetterMetadata: (exhausted
          ? {
              failedAt: new Date().toISOString(),
              reason: error.message,
              bullJobId: job.id ?? null,
            }
          : null) as never,
        lastError: error.message,
        status: exhausted ? 'dead_lettered' : 'failed',
      },
    );
  }
}
