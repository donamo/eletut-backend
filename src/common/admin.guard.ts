import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request =
      context.getType<string>() === 'graphql'
        ? GqlExecutionContext.create(context).getContext().req
        : context.switchToHttp().getRequest();
    const adminEmail = this.config.get<string>('ADMIN_EMAIL')?.trim();
    const userEmail = request.user?.email as string | undefined;

    if (
      adminEmail &&
      userEmail &&
      adminEmail.toLowerCase() === userEmail.toLowerCase()
    ) {
      return true;
    }

    throw new ForbiddenException('Admin access is required.');
  }
}
