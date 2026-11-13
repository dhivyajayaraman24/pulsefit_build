import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuditComplianceModule } from '../modules/audit-compliance';
import {
  CorrelationIdMiddleware,
  DatabaseModule,
  LoggingModule,
  ObservabilityModule,
  QueueModule,
  RequestLoggingMiddleware,
  SecurityDefaultsModule,
} from './common';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    LoggingModule,
    ObservabilityModule,
    DatabaseModule,
    QueueModule,
    AuditComplianceModule,
    HealthModule,
    SecurityDefaultsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware, RequestLoggingMiddleware).forRoutes('*');
  }
}
