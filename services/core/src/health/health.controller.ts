import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  home() {
    return {
      service: 'PulseFit Core',
      status: 'ok',
      routes: ['/', '/v1/health'],
    };
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'core',
      timestamp: new Date().toISOString(),
    };
  }
}
