import {
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from '../common/authenticated.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';
import { GoogleCallbackGuard, GoogleLoginGuard } from './google-auth.guard';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  @Get('auth/login/google')
  @UseGuards(GoogleLoginGuard)
  loginWithGoogle() {
    return undefined;
  }

  @Get('auth/callback/google')
  @UseGuards(GoogleCallbackGuard)
  googleCallback(@Req() request: Request, @Res() response: Response) {
    const user = request.user as User | undefined;
    const redirectUrl = this.config.get<string>('FRONTEND_URL') ?? '/';
    this.logger.debug(
      `Google callback completed session=${request.sessionID ?? 'none'} user=${user?.id ?? 'missing'} redirect=${redirectUrl}`,
    );
    request.session.save((error) => {
      if (error) {
        this.logger.error(
          `Failed to save Google callback session user=${user?.id ?? 'missing'}`,
        );
        response.status(500).send('Failed to save session.');
        return;
      }

      this.logger.debug(
        `Google callback session saved user=${user?.id ?? 'missing'} session=${request.sessionID ?? 'none'}`,
      );
      response.redirect(redirectUrl);
    });
  }

  @Post('auth/logout')
  logout(@Req() request: Request, @Res() response: Response) {
    const user = request.user as User | undefined;
    this.logger.debug(
      `Logout requested session=${request.sessionID ?? 'none'} user=${user?.id ?? 'anonymous'}`,
    );
    request.logout(() => {
      request.session?.destroy(() => {
        this.logger.debug('Session destroyed during logout.');
        response.clearCookie('connect.sid');
        response.status(204).send();
      });
    });
  }

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  me(@CurrentUser() user: User) {
    this.logger.debug(`Returning current user id=${user.id}`);
    return this.usersService.withAdminFlag(user);
  }
}
