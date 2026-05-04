import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticatedGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request =
      context.getType<string>() === 'graphql'
        ? GqlExecutionContext.create(context).getContext().req
        : context.switchToHttp().getRequest();

    if (!request.user) {
      this.logger.warn(
        `Unauthorized ${request.method ?? 'GRAPHQL'} ${request.originalUrl ?? 'graphql'} session=${request.sessionID ?? 'none'} cookie=${request.headers?.cookie ? 'yes' : 'no'}`,
      );
      throw new UnauthorizedException('Authentication is required.');
    }

    this.logger.debug(
      `Authenticated request user=${request.user.id ?? 'unknown'} session=${request.sessionID ?? 'none'}`,
    );
    return true;
  }
}
