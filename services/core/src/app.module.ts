import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuditComplianceModule } from '../modules/audit-compliance';
import { CorrelationIdMiddleware, DatabaseModule, QueueModule } from './common';
import { HealthModule } from './health/health.module';

@Module({
  imports: [DatabaseModule, QueueModule, AuditComplianceModule, HealthModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
