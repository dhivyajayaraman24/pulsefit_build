import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { JobMetadata } from '../src/common/database';
import { JobQueueService } from '../src/common/queue/job-queue.service';
import { PLATFORM_QUEUE, SAMPLE_JOB_NAME } from '../src/common/queue/queue.constants';
import { CreatePlatformFoundations1730000000000 } from '../db/migrations/1730000000000-CreatePlatformFoundations';

describe('platform persistence foundations', () => {
  it('migration creates base platform tables and job idempotency index', async () => {
    const queries: string[] = [];
    const migration = new CreatePlatformFoundations1730000000000();
    const queryRunner = {
      query: jest.fn((sql: string) => {
        queries.push(sql);
        return Promise.resolve();
      }),
    };

    await migration.up(queryRunner as never);

    const allSql = queries.join('\n');
    expect(allSql).toContain('CREATE TABLE branches');
    expect(allSql).toContain('CREATE TABLE roles');
    expect(allSql).toContain('CREATE TABLE users');
    expect(allSql).toContain('CREATE TABLE audit_logs');
    expect(allSql).toContain('CREATE TABLE job_metadata');
    expect(allSql).toContain('CREATE UNIQUE INDEX idx_job_metadata_idempotency_unique');
  });
});

describe('JobQueueService', () => {
  const makeRepository = () => {
    const saved: JobMetadata[] = [];
    return {
      create: jest.fn((input: Partial<JobMetadata>) => input as JobMetadata),
      findOne: jest.fn(),
      save: jest.fn((input: JobMetadata) => {
        const persisted = {
          ...input,
          id: input.id ?? `job-${saved.length + 1}`,
        } as JobMetadata;
        saved.push(persisted);
        return Promise.resolve(persisted);
      }),
      saved,
    };
  };

  it('records sample queued job status and preserves idempotency metadata', async () => {
    const queue = {
      add: jest.fn().mockResolvedValue({ id: 'bull-123' }),
    } as unknown as Queue;
    const repository = makeRepository();
    const service = new JobQueueService(
      queue,
      repository as unknown as Repository<JobMetadata>,
    );

    const result = await service.enqueueSampleJob({
      branchId: 'branch-1',
      correlationId: 'corr-1',
      idempotencyKey: 'idem-1',
      payload: {
        requestedBy: 'user-1',
        sampleId: 'sample-1',
      },
      schemaVersion: 1,
    });

    expect(result.status).toBe('queued');
    expect(result.bullJobId).toBe('bull-123');
    expect(result.idempotencyKey).toBe('idem-1');
    expect(result.correlationId).toBe('corr-1');
    expect(repository.save).toHaveBeenCalledTimes(2);
    expect(queue.add).toHaveBeenCalledWith(
      SAMPLE_JOB_NAME,
      expect.objectContaining({
        correlationId: 'corr-1',
        idempotencyKey: 'idem-1',
        schemaVersion: 1,
      }),
      expect.objectContaining({
        attempts: 3,
        jobId: `${PLATFORM_QUEUE}:idem-1`,
      }),
    );
  });

  it('returns existing job metadata for duplicate idempotency keys', async () => {
    const existing = {
      id: 'job-existing',
      queueName: PLATFORM_QUEUE,
      idempotencyKey: 'idem-1',
      status: 'queued',
    } as JobMetadata;
    const queue = {
      add: jest.fn(),
    } as unknown as Queue;
    const repository = makeRepository();
    repository.findOne.mockResolvedValue(existing);
    const service = new JobQueueService(
      queue,
      repository as unknown as Repository<JobMetadata>,
    );

    await expect(
      service.enqueueSampleJob({
        correlationId: 'corr-1',
        idempotencyKey: 'idem-1',
        payload: {
          requestedBy: 'user-1',
          sampleId: 'sample-1',
        },
        schemaVersion: 1,
      }),
    ).resolves.toBe(existing);

    expect(queue.add).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });
});
