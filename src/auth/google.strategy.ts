import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { UsersService } from '../users/users.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      clientID: config.get<string>('GOOGLE_CLIENT_ID') ?? 'missing-client-id',
      clientSecret:
        config.get<string>('GOOGLE_CLIENT_SECRET') ?? 'missing-client-secret',
      callbackURL:
        config.get<string>('GOOGLE_CALLBACK_URL') ??
        'http://localhost:3000/auth/callback/google',
      scope: ['openid', 'email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      this.logger.warn('Google profile validation failed: missing email.');
      return done(new Error('Google profile did not include an email.'));
    }

    const user = await this.usersService.upsertFromGoogle({
      googleSubject: profile.id,
      email,
      displayName: profile.displayName,
    });

    if (!user.isEnabled && !this.usersService.isAdminEmail(user.email)) {
      this.logger.warn(
        `Google profile validated but user is disabled googleSubject=${profile.id} user=${user.id} email=${user.email}`,
      );
      return done(new ForbiddenException('User is not enabled.'));
    }

    this.logger.debug(
      `Google profile validated googleSubject=${profile.id} user=${user.id} emailPresent=yes displayNamePresent=${profile.displayName ? 'yes' : 'no'}`,
    );

    return done(null, user);
  }
}
