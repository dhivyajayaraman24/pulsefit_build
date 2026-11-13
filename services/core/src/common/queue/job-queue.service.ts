import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { JobMetadata } from '../database';
import { PLATFORM_QUEUE, SAMPLE_JOB_NAME } from './queue.constants';
import { EnqueueJobInput, QueueJobEnvelope } from './queue.types';

@Injectable()
export class JobQueueService {
  constructor(
    @InjectQueue(PLATFORM_QUEUE)
    private readonly platformQueue: Queue<QueueJobEnvelope>,
    @InjectRepository(JobMetadata)
    private readonly jobMetadata: Repository<JobMetadata>,
  ) {}

  async enqueue(input: EnqueueJobInput): Promise<JobMetadata> {
    const maxAttempts = input.maxAttempts ?? 3;
    const existing = await this.jobMetadata.findOne({
      where: {
        queueName: PLATFORM_QUEUE,
        idempotencyKey: input.idempotencyKey,
      },
    });

    if (existing) {
      return existing;
    }

    const metadata = await this.jobMetadata.save(
      this.jobMetadata.create({
        branchId: input.branchId ?? null,
        correlationId: input.correlationId,
        idempotencyKey: input.idempotencyKey,
        jobName: input.jobName,
        maxAttempts,
        payload: input.payload,
        queueName: PLATFORM_QUEUE,
        schemaVersion: input.schemaVersion,
        status: 'queued',
      }),
    );

    const queuedJob = await this.platformQueue.add(
      input.jobName,
      {
        branchId: input.branchId ?? null,
        correlationId: input.correlationId,
        idempotencyKey: input.idempotencyKey,
        payload: input.payload,
        schemaVersion: input.schemaVersion,
      },
      {
        attempts: maxAttempts,
        jobId: `${PLATFORM_QUEUE}:${input.idempotencyKey}`,
        removeOnComplete: false,
        removeOnFail: false,
      },
    );

    metadata.bullJobId = queuedJob.id ?? null;
    return this.jobMetadata.save(metadata);
  }

  enqueueSampleJob(
    envelope: QueueJobEnvelope<{ sampleId: string; requestedBy: string }>,
  ): Promise<JobMetadata> {
    return this.enqueue({
      ...envelope,
      jobName: SAMPLE_JOB_NAME,
    });
  }
}
