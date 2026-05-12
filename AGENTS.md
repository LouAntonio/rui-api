# Agents

## Setup

```bash
npm install
cp .env.sample .env   # fill in DATABASE_URL, JWT secrets, Cloudinary, Resend
npm run db:generate   # must run after install or schema changes
npm run dev           # starts with --watch
```

## Database

- **Prisma 7** with `@prisma/adapter-pg` (uses pg driver, not default Prisma connection pooler). Client lives in `src/configs/prisma.js`.
- `prisma generate` must be re-run after any schema change.
- Migrations are in `prisma/migrations/`.
- Do not confuse `prisma migrate dev` (dev) with `prisma migrate deploy` (prod).

## No tests, no lint

There is no test suite (`npm test` is a stub) and no ESLint config. Do not add test commands or lint scripts without explicit instruction.

## Architecture

- **CommonJS** (`"type": "commonjs"` in package.json). Use `require()`, not `import`.
- Entry point: `src/server.js`
- App: `src/app.js`
- Routes, controllers (inline in routes), services, middlewares.
- Models: `User`, `Category`, `Dish`, `RefreshToken` (see `prisma/schema.prisma`). The README describes a different schema.
- Swagger specs are defined as JSDoc comments inside `src/routes/*.js`.

## Auth

- JWT with separate secrets per role (user/admin). Refresh tokens stored in DB.
- `src/middlewares/auth.middleware.js` — verifyJWT
- `src/middlewares/rbac.middleware.js` — checkRole(role)
- Roles: `ADMIN`, `SELLER` (enum in schema)

## Security

- CORS allows only `http://localhost:5173` (hardcoded in `src/app.js:16`).
- Helmet CSP disabled on `/docs` path only.
- Global rate limit: 100 req/min per IP.
- Password hashing: bcrypt.

## Logs

- Written to `logs/all-YYYY-MM-DD.log` and `logs/error-YYYY-MM-DD.log` via Winston.
- `logs/` is gitignored.

## Env vars to know

| Variable       | Note                                         |
| -------------- | -------------------------------------------- |
| `PORT`         | Default 20262                                |
| `TZ`           | Default `Africa/Luanda` — affects timestamps |
| `NODE_ENV`     | `development` uses localhost URLs            |
| `FRONTEND_URL` | `http://localhost:5173`                      |
| `BACKEND_URL`  | Used by Swagger server definition            |
