# Node.js Server Template

REST API server built with **Node.js**, **Express** and **Prisma ORM**. Includes JWT authentication, refresh tokens, role-based access control, Swagger documentation, rate limiting, structured logging, Cloudinary image uploads, email via Resend, and PostgreSQL support.

---

## Technologies

| Layer     | Technology                       |
| --------- | -------------------------------- |
| Runtime   | Node.js (CommonJS)               |
| Framework | Express 5                        |
| ORM       | Prisma 7 + `@prisma/adapter-pg`  |
| Database  | PostgreSQL                       |
| Auth      | JWT (separate secrets per role)  |
| Hashing   | bcrypt                           |
| Email     | Resend                           |
| Uploads   | Cloudinary + multer              |
| Docs      | Swagger UI (OpenAPI 3.0)         |
| Logging   | Winston                          |
| Security  | Helmet, CORS, express-rate-limit |

---

## Project Structure

```
prisma/
   schema.prisma          # Database schema
   migrations/            # SQL migrations
src/
   app.js                 # Express setup
   server.js              # Entry point
   configs/
      cloudinary.js       # Cloudinary config
      prisma.js           # Prisma client (with pg adapter)
      swagger.js          # Swagger config
   controllers/           # Route handlers (inline logic)
   middlewares/
      auth.middleware.js  # JWT verification
      errors.middleware.js# Error handling
      rbac.middleware.js  # Role & permission checks
      upload.middleware.js# Multer + Cloudinary upload
   routes/
      index.router.js     # Base routes (/, /health)
      user.router.js      # Auth & user management
      category.router.js  # Category management
      dish.router.js       # Dish management
   services/              # Business logic
   utils/
      logger.util.js      # Winston logger
logs/                      # Log files (auto-generated)
.env.sample                # Environment variables template
package.json
prisma.config.ts
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [PostgreSQL](https://www.postgresql.org/) >= 14

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.sample .env
# Edit .env with your values

# 3. Generate Prisma client (required after install or schema changes)
npm run db:generate

# 4. Run migrations (development)
npm run db:migrate

# 5. Start development server
npm run dev
```

---

## Environment Variables

Copy `.env.sample` to `.env` and fill in the values:

```env
PORT=20262
NODE_ENV=development

FRONTEND_URL=http://localhost:5173
BACKEND_URL=https://api.example.com

# JWT — separate secrets per role
JWT_USER_SECRET=
JWT_ADMIN_SECRET=
JWT_USER_REFRESH_SECRET=
JWT_ADMIN_REFRESH_SECRET=
JWT_RESET_PASSWORD_SECRET=
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=1d

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RESEND_API_KEY=
EMAIL_FROM=

TZ=Africa/Luanda

DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

---

## Scripts

| Command                   | Description                                                 |
| ------------------------- | ----------------------------------------------------------- |
| `npm start`               | Start server (production)                                   |
| `npm run dev`             | Start server with `--watch` (development)                   |
| `npm run db:generate`     | Generate Prisma client                                      |
| `npm run db:migrate`      | Run migrations (dev) — use `db:migrate:prod` for production |
| `npm run db:migrate:prod` | Apply migrations (production)                               |
| `npm run db:push`         | Push schema without migration                               |
| `npm run db:pull`         | Import schema from existing database                        |
| `npm run db:seed`         | Run seeder                                                  |
| `npm run db:reset`        | Reset database                                              |
| `npm run db:studio`       | Open Prisma Studio                                          |

---

## API Routes

### Base

| Method | Route     | Description           |
| ------ | --------- | --------------------- |
| GET    | `/`       | API status            |
| GET    | `/health` | Health check (uptime) |

### Authentication (`/users`)

| Method | Route                           | Description                            |
| ------ | ------------------------------- | -------------------------------------- |
| POST   | `/users/register`               | Register new user                      |
| POST   | `/users/login`                  | User login                             |
| POST   | `/users/admin/login`            | Admin login                            |
| POST   | `/users/refresh-token`          | Refresh access token (httpOnly cookie) |
| POST   | `/users/logout`                 | Logout (revoke current refresh token)  |
| POST   | `/users/logout-all`             | Logout from all devices                |
| GET    | `/users/is-logged-in`           | Check user session                     |
| GET    | `/users/admin/is-logged-in`     | Check admin session                    |
| POST   | `/users/request-password-reset` | Request password reset                 |
| POST   | `/users/reset-password`         | Reset password with token              |

### User Management (`/users`) — Admin only

| Method | Route                  | Description                      |
| ------ | ---------------------- | -------------------------------- |
| POST   | `/users/list`          | List users (filters, pagination) |
| GET    | `/users/:id`           | Get user by ID                   |
| PATCH  | `/users/:id`           | Update user                      |
| DELETE | `/users/:id`           | Delete user                      |
| PATCH  | `/users/update-role`   | Change user role                 |
| PATCH  | `/users/toggle-status` | Activate/suspend user            |

### Categories (`/categories`)

| Method | Route             | Description        | Auth   |
| ------ | ----------------- | ------------------ | ------ |
| GET    | `/categories`     | List categories    | Public |
| GET    | `/categories/:id` | Get category by ID | Public |
| POST   | `/categories`     | Create category    | Admin  |
| PATCH  | `/categories/:id` | Update category    | Admin  |
| DELETE | `/categories/:id` | Delete category    | Admin  |

### Dishes (`/dishes`)

| Method | Route                  | Description                       | Auth   |
| ------ | ---------------------- | --------------------------------- | ------ |
| GET    | `/dishes`              | List dishes (filters, pagination) | Public |
| GET    | `/dishes/by-date`      | List dishes available on a date   | Public |
| GET    | `/dishes/:id`          | Get dish by ID                    | Public |
| POST   | `/dishes`              | Create dish                       | Admin  |
| PATCH  | `/dishes/:id`          | Update dish                       | Admin  |
| DELETE | `/dishes/:id`          | Delete dish                       | Admin  |
| POST   | `/dishes/upload-image` | Upload dish image (multipart)     | Admin  |

---

## Data Models

### User

| Field       | Type       | Description                           |
| ----------- | ---------- | ------------------------------------- |
| `id`        | UUID       | Unique identifier                     |
| `name`      | String     | First name                            |
| `surname`   | String     | Last name                             |
| `email`     | String     | Email (unique)                        |
| `password`  | String     | Password (bcrypt hashed)              |
| `role`      | Role       | `ADMIN` \| `SELLER`                   |
| `status`    | UserStatus | `ACTIVE` \| `INACTIVE` \| `SUSPENDED` |
| `lastLogin` | DateTime   | Last login timestamp                  |
| `createdAt` | DateTime   | Creation date                         |
| `updatedAt` | DateTime   | Last update                           |

### Category

| Field  | Type   | Description       |
| ------ | ------ | ----------------- |
| `id`   | UUID   | Unique identifier |
| `name` | String | Name (unique)     |

### Dish

| Field           | Type        | Description                |
| --------------- | ----------- | -------------------------- |
| `id`            | UUID        | Unique identifier          |
| `name`          | String      | Dish name                  |
| `description`   | String?     | Optional description       |
| `price`         | Decimal     | Price (10,2)               |
| `imageUrl`      | String?     | Cloudinary image URL       |
| `isActive`      | Boolean     | Whether dish is available  |
| `categories`    | Category[]  | Many-to-many categories    |
| `availableDays` | DayOfWeek[] | Days the dish is available |
| `createdAt`     | DateTime    | Creation date              |
| `updatedAt`     | DateTime    | Last update                |

---

## Security

- **Helmet** — HTTP security headers (CSP disabled on `/docs` only)
- **CORS** — Allows `http://localhost:5173` only (hardcoded in `app.js`)
- **Global rate limit** — 100 req/min per IP
- **Login rate limit** — 5 attempts per 15 minutes
- **JWT** — Separate secrets per role; auto-refresh when token has < 15 min left (new token in `x-renewed-token` header)
- **Passwords** — Hashed with bcrypt

---

## Logging

Logs are written to `logs/` with daily rotation:

- `logs/all-YYYY-MM-DD.log` — all levels
- `logs/error-YYYY-MM-DD.log` — errors only

Also printed to terminal with colors in development.

---

## Swagger Documentation

With the server running, access the interactive docs at:

```
http://localhost:<PORT>/docs
```

---

## License

MIT
