import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthResolver } from './auth.resolver';
import { GoogleCallbackGuard, GoogleLoginGuard } from './google-auth.guard';
import { GoogleStrategy } from './google.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [PassportModule.register({ session: true }), UsersModule],
  controllers: [AuthController],
  providers: [
    GoogleStrategy,
    GoogleLoginGuard,
    GoogleCallbackGuard,
    SessionSerializer,
    AuthResolver,
  ],
})
export class AuthModule {}
