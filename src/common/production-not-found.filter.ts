import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

const getRequestIp = (request: Request) =>
  request.ip ||
  request.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
  request.socket.remoteAddress ||
  'unknown';

@Catch(NotFoundException)
export class ProductionNotFoundFilter
  implements ExceptionFilter<NotFoundException>
{
  private readonly logger = new Logger(ProductionNotFoundFilter.name);

  catch(exception: NotFoundException, host: ArgumentsHost) {
    if (host.getType() !== 'http') {
      throw exception;
    }

    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    this.logger.warn(
      `Production 404 response body suppressed ip=${getRequestIp(request)} method=${request.method} url=${request.originalUrl}`,
    );
    response.status(404).end();
  }
}
