# Task completion checklist

Before finishing backend code changes:
1. Run `npm run build`.
2. Run `npm run lint`.
3. Run `npx prisma validate` if Prisma schema or DB-related code changed.
4. Run `npx prisma migrate status` or `npx prisma migrate deploy` when migrations are touched and DB access is intended.
5. Run focused tests with `npm test` once test files exist or when changing tested behavior.
6. Check `git status --short` and mention relevant changed files.

Operational notes:
- Network/DB commands may need elevated execution in sandboxed environments.
- Do not run `npm audit fix --force` blindly; it previously wanted to downgrade `@nestjs/apollo` despite the current Apollo 5 setup.
- Keep `.env` uncommitted; update `.env.example` for shared defaults.