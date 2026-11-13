import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PlaceholderAuthMiddleware } from './placeholder-auth.middleware';
import { SecurityDefaultsController } from './security-defaults.controller';
import { AuthenticatedContextGuard, BranchScopeGuard, RbacGuard } from '../guards';

@Module({
  controllers: [SecurityDefaultsController],
  providers: [AuthenticatedContextGuard, BranchScopeGuard, RbacGuard],
  exports: [AuthenticatedContextGuard, BranchScopeGuard, RbacGuard],
})
export class SecurityDefaultsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PlaceholderAuthMiddleware).forRoutes('*');
  }
}

