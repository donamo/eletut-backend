import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  private readonly logger = new Logger(AuthenticatedGuard.name);

  constructor(private readonly config: ConfigService) {}

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

    const adminEmail = this.config.get<string>('ADMIN_EMAIL')?.trim();
    const userEmail = request.user.email as string | undefined;
    const isAdmin =
      adminEmail &&
      userEmail &&
      adminEmail.toLowerCase() === userEmail.toLowerCase();

    if (!request.user.isEnabled && !isAdmin) {
      this.logger.warn(
        `Disabled user blocked user=${request.user.id ?? 'unknown'} email=${userEmail ?? 'missing'} session=${request.sessionID ?? 'none'}`,
      );
      throw new ForbiddenException('User is not enabled.');
    }

    this.logger.debug(
      `Authenticated request user=${request.user.id ?? 'unknown'} session=${request.sessionID ?? 'none'}`,
    );
    return true;
  }
}
