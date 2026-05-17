import { Controller, Get, HttpCode, Res } from '@nestjs/common';
import { Response } from 'express';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  @HttpCode(200)
  async check(@Res() res: Response) {
    const result = await this.health.check();
    res.status(result.status === 'ok' ? 200 : 503).json(result);
  }
}
