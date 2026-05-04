# Style and conventions

Language/style:
- TypeScript with `strict: true` in `tsconfig.json`.
- NestJS module/service/controller/resolver pattern.
- Class names use PascalCase; variables, methods, and fields use camelCase.
- DTOs use `class-validator` decorators and GraphQL `@InputType`/`@Field` decorators.
- GraphQL object models live under `models/` and should use explicit field types for nullable or ambiguous fields, e.g. `@Field(() => String, { nullable: true })`.
- Prisma access should go through `PrismaService`, not direct new Prisma clients.
- Keep REST and GraphQL behavior backed by shared services to avoid duplicated authorization logic.
- Do not add broad authorization roles for MVP; the key privacy invariant is owner scoping.

Validation expectations:
- Life event title is required, non-empty, max 150 chars.
- Description is optional, max 10000 chars.
- Date precision must be `YEAR`, `MONTH`, or `DAY`.

Generated/artifact files:
- `node_modules`, `dist`, `.env`, coverage, and local DB files are ignored.
- GraphQL schema is generated in memory (`autoSchemaFile: true`), not committed as `src/schema.gql`.