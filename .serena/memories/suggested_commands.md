# Suggested commands

Setup:
- `npm install`
- `cp .env.example .env`
- `npm run prisma:generate`
- `npm run prisma:migrate`

Development:
- `npm run start:dev` - run Nest in watch mode
- `npm run start` - run Nest once
- `npm run build` - compile the project
- `npm run lint` - run ESLint over `src/**/*.ts`
- `npm test` - run Jest tests if specs exist

Prisma:
- `npx prisma validate` - validate schema
- `npx prisma migrate status` - check DB migration state
- `npx prisma migrate deploy` - apply existing migrations to the configured DB
- `npm run prisma:studio` - open Prisma Studio

PostgreSQL connection:
- Local `.env` should use `DATABASE_URL="postgresql://postgres:postgres@192.168.1.2:5432/eletut"` if `dev.home` gives Prisma `P1001`.
- Docker psql check: `docker run --rm -it -e PGPASSWORD=postgres postgres:16 psql -h dev.home -p 5432 -U postgres -d eletut`

Useful Darwin/macOS shell commands:
- `rg --files`, `rg <pattern>` for search
- `find <path> -maxdepth <n> -type f` when `rg` is not enough
- `dscacheutil -q host -a name dev.home` to check host DNS
- `nc -vz <host> <port>` to check TCP connectivity
- `git status --short` to inspect worktree state