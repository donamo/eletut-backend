import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from '../users/models/user.model';

@Injectable()
export class GoogleLoginGuard extends AuthGuard('google') {}

@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
  private readonly logger = new Logger(GoogleCallbackGuard.name);

  async canActivate(context: ExecutionContext) {
    const canActivate = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as User | undefined;

    this.logger.debug(
      `Google callback guard authenticated=${canActivate} user=${user?.id ?? 'missing'} sessionBeforeLogin=${request.sessionID ?? 'none'}`,
    );

    await super.logIn(request);

    this.logger.debug(
      `Google callback guard logged in user=${user?.id ?? 'missing'} sessionAfterLogin=${request.sessionID ?? 'none'}`,
    );

    return canActivate;
  }
}
