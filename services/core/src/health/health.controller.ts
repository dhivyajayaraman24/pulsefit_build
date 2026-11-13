import { Controller, Get, Req } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CORRELATION_ID_HEADER, CorrelatedRequest } from '../common';

@ApiTags('health')
@ApiHeader({
  name: CORRELATION_ID_HEADER,
  required: false,
  description: 'Optional caller-provided correlation ID echoed in the response.',
})
@Controller('health')
export class HealthController {
  @ApiOkResponse({
    schema: {
      type: 'object',
      required: ['status', 'service', 'timestamp', 'correlationId'],
      properties: {
        status: { type: 'string', example: 'ok' },
        service: { type: 'string', example: 'core' },
        timestamp: { type: 'string', format: 'date-time' },
        correlationId: { type: 'string', example: '7f2f0b9b-7c3c-4f2e-8f9d-3cf28c8a2c47' },
      },
    },
  })
  @Get()
  health(@Req() request: CorrelatedRequest) {
    return {
      status: 'ok',
      service: 'core',
      timestamp: new Date().toISOString(),
      correlationId: request.correlationId,
    };
  }
}
