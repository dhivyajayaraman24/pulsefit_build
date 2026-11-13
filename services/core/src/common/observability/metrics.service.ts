import { Injectable } from '@nestjs/common';

export type MetricAttributes = Record<string, string | number | boolean>;

export interface CounterSample {
  name: string;
  value: number;
  attributes: MetricAttributes;
}

@Injectable()
export class MetricsService {
  private readonly counters = new Map<string, CounterSample>();

  incrementCounter(name: string, attributes: MetricAttributes = {}, value = 1) {
    const key = JSON.stringify({ name, attributes });
    const existing = this.counters.get(key);
    this.counters.set(key, {
      name,
      attributes,
      value: (existing?.value ?? 0) + value,
    });
  }

  snapshot() {
    return Array.from(this.counters.values());
  }
}

