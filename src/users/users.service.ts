import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export type GoogleProfile = {
  googleSubject: string;
  email: string;
  displayName?: string | null;
};

type UserRecord = Awaited<ReturnType<PrismaService['user']['findUnique']>>;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return this.withOptionalAdminFlag(user);
  }

  findByGoogleSubject(googleSubject: string) {
    return this.prisma.user.findUnique({ where: { googleSubject } });
  }

  withAdminFlag<T extends { email: string }>(user: T) {
    return {
      ...user,
      isAdmin: this.isAdminEmail(user.email),
    };
  }

  withOptionalAdminFlag(user: UserRecord) {
    return user ? this.withAdminFlag(user) : null;
  }

  upsertFromGoogle(profile: GoogleProfile) {
    const isAdmin = this.isAdminEmail(profile.email);

    return this.prisma.user.upsert({
      where: { googleSubject: profile.googleSubject },
      update: {
        email: profile.email,
        displayName: profile.displayName,
        ...(isAdmin ? { isEnabled: true } : {}),
      },
      create: {
        googleSubject: profile.googleSubject,
        email: profile.email,
        displayName: profile.displayName,
        isEnabled: isAdmin,
      },
    }).then((user) => this.withAdminFlag(user));
  }

  async list() {
    const users = await this.prisma.user.findMany({
      orderBy: [{ createdAt: 'desc' }],
    });
    return users.map((user) => this.withAdminFlag(user));
  }

  async updateEnabled(id: string, isEnabled: boolean) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isEnabled },
    });
    return this.withAdminFlag(user);
  }

  isAdminEmail(email: string | null | undefined) {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL')?.trim();
    return Boolean(
      adminEmail && email && adminEmail.toLowerCase() === email.toLowerCase(),
    );
  }
}
