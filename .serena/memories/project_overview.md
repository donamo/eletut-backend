# Project overview

`eletut-backend` is the backend for the Életvonal / life timeline MVP. It is a private single-user-per-account application where authenticated users manage only their own life events.

Core stack:
- TypeScript
- NestJS 11
- Apollo GraphQL 5 via `@nestjs/graphql` and `@nestjs/apollo`
- Prisma 6
- PostgreSQL (`DATABASE_URL` currently points to `postgresql://postgres:postgres@192.168.1.2:5432/eletut` in local `.env`)
- Passport Google OAuth/OpenID with server-side sessions
- class-validator / class-transformer for DTO validation

Main domain models:
- `User`: Google subject, email, optional display name, timestamps
- `LifeEvent`: owner user id, title, optional description, date value, date precision (`YEAR | MONTH | DAY`), timestamps

The API exposes both REST endpoints from the MVP spec and GraphQL queries/mutations.