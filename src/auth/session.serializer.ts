import { Injectable, Logger } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from '../users/models/user.model';
import { UsersService } from '../users/users.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  private readonly logger = new Logger(SessionSerializer.name);

  constructor(private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: (err: Error | null, id?: string) => void) {
    this.logger.debug(`Serializing user into session id=${user.id}`);
    done(null, user.id);
  }

  async deserializeUser(
    id: string,
    done: (err: Error | null, user?: User | null) => void,
  ) {
    try {
      const user = await this.usersService.findById(id);
      this.logger.debug(
        `Deserialized session user id=${id} found=${user ? 'yes' : 'no'}`,
      );
      done(null, user);
    } catch (error) {
      this.logger.error(`Failed to deserialize session user id=${id}`);
      done(error as Error);
    }
  }
}
