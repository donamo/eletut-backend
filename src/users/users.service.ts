import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type GoogleProfile = {
  googleSubject: string;
  email: string;
  displayName?: string | null;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByGoogleSubject(googleSubject: string) {
    return this.prisma.user.findUnique({ where: { googleSubject } });
  }

  upsertFromGoogle(profile: GoogleProfile) {
    return this.prisma.user.upsert({
      where: { googleSubject: profile.googleSubject },
      update: {
        email: profile.email,
        displayName: profile.displayName,
      },
      create: {
        googleSubject: profile.googleSubject,
        email: profile.email,
        displayName: profile.displayName,
      },
    });
  }
}
