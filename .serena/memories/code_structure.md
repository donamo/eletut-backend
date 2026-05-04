# Code structure

Important directories and files:
- `src/main.ts`: Nest bootstrap, global validation pipe, CORS, session and Passport initialization.
- `src/app.module.ts`: root module, config, GraphQL setup, Prisma, users, auth, and life-events modules.
- `src/prisma/`: global Prisma module and `PrismaService` lifecycle wrapper.
- `src/users/`: user model and service for lookup/upsert from Google profile.
- `src/auth/`: Google strategy, Passport session serializer, auth REST controller, `me` GraphQL resolver.
- `src/common/`: `AuthenticatedGuard` and `CurrentUser` decorator shared by REST and GraphQL.
- `src/life-events/`: DTOs, GraphQL models/enums, REST controller, GraphQL resolver, owner-scoped service.
- `prisma/schema.prisma`: Prisma schema for PostgreSQL.
- `prisma/migrations/20260430180500_init/migration.sql`: initial PostgreSQL migration.

Important ownership rule: every life-event read/write/delete must filter by `ownerUserId` from the authenticated user. The service currently enforces this via `findFirst({ id, ownerUserId })` before updates/deletes.