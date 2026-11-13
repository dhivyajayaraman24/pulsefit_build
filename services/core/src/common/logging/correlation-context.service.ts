import { AsyncLocalStorage } from 'async_hooks';
import { Injectable } from '@nestjs/common';

export interface CorrelationContextState {
  correlationId: string;
}

@Injectable()
export class CorrelationContextService {
  private readonly storage = new AsyncLocalStorage<CorrelationContextState>();

  run<T>(state: CorrelationContextState, callback: () => T): T {
    return this.storage.run(state, callback);
  }

  getCorrelationId() {
    return this.storage.getStore()?.correlationId;
  }
}

