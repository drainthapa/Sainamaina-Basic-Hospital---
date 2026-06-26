# Sainamaina Basic Hospital Portal — Backend (Phase 1)

This is the Express + PostgreSQL backend for the hospital portal. It covers the
**foundation** layer: database schema, migrations, seed data, JWT authentication
with role-based access control, and REST APIs for the MVP content modules
(Departments, Staff/Doctors, News/Notices, Downloads, Gallery, Pages, FAQs, Settings).

This is Phase 1 of the project. The React frontend conversion and the CMS admin
UI are separate phases that will sit alongside this backend.

## What's included in this phase

- PostgreSQL schema (8 migration files, fully normalized, with indexes, foreign
  keys, and soft deletes)
- Seed script: 6 system roles, a super admin user, news/download categories,
  starter CMS pages, hospital service categories
- JWT auth: login, refresh (rotating, httpOnly cookie), logout, forgot/reset
  password, change password
- Role-based access control (6 roles, route-level permission checks)
- REST APIs for: Departments, Hospital Services, Staff (covers Doctors + all
  staff types), News (covers News / Notices / Press Releases / Tender
  Notices / Health Articles / Events), Downloads (covers Acts / Policies /
  Guidelines / Forms / Action Plans / Budget / Annual Reports / Publications
  / Citizen Charter / Unicode Downloads), Gallery (photo & video albums),
  generic Pages, FAQs, Site Settings, category management, Users (CMS
  account management), and Contact form submissions
- File upload endpoint (local disk storage by default; Cloudinary/S3 hook
  points are stubbed but not wired up yet)
- Security middleware: Helmet, CORS, rate limiting, input validation,
  bcrypt-compatible password hashing (via bcryptjs — pure JS, no native build
  step needed), audit logging

## Why a few choices differ from the original spec

After reviewing your actual frontend pages, a few things in the database
design were simplified on purpose, because the real pages don't need the
extra complexity:

- **One `staff` table**, not separate Doctors/Staff tables. Your
  `employee.html` lists everyone — hospital chief, medical officers, nurses,
  admin staff — in one table distinguished only by designation. The `staff`
  table has a `staff_type` column (`doctor` / `nursing` / `administrative` /
  `technical` / `support`) plus optional doctor-specific fields
  (`specialization`, `qualification`) that simply stay empty for non-doctor
  rows.
- **One `downloads` table**, not eight. Acts, Policies, Guidelines, Forms,
  Budget & Program, Annual Reports, Other Reports, Publications, Citizen
  Charter, and Unicode Downloads are all the same `#, title, file` table in
  your HTML — they're really one content type filtered by `doc_type`.
- **One `news` table**, not five. News, Notices, Press Releases, Tender
  Notices, Health Articles, and Events all share the same shape (title, date,
  optional attachment) and are filtered by `module_type`.
- **`bs_date` stored as text alongside a real `ad_date` column.** Your site
  displays Bikram Sambat dates (e.g. "१४ फागुन २०७७"). Postgres has no native
  BS calendar type, so the canonical Gregorian date drives sorting/filtering,
  and the BS string is stored as-given for display. A BS↔AD conversion
  utility is not yet implemented — for now the CMS form will need the BS
  string entered manually alongside the AD date picker.

## Prerequisites (Windows / local machine, no XAMPP needed for this part)

You only need:

1. **Node.js** (v18 or newer) — https://nodejs.org
2. **PostgreSQL** (v14+) — https://www.postgresql.org/download/windows/, or
   use pgAdmin which bundles it.

You do **not** need XAMPP's Apache or MySQL for this project — Express
replaces Apache, and PostgreSQL replaces MySQL. If XAMPP is already installed,
it's fine to leave it running for other projects; just make sure nothing else
is using port 5432 (Postgres) or 5000 (this API).

## Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
- Set `DB_PASSWORD` to your local Postgres password (set during Postgres
  install, or via pgAdmin → right-click the `postgres` role → Properties).
- Generate two long random strings for `JWT_ACCESS_SECRET` and
  `JWT_REFRESH_SECRET` (anything works for local dev, e.g. mash the keyboard
  for 40+ characters — just don't reuse these in production).

Create the database (via pgAdmin, or `psql`):

```sql
CREATE DATABASE hospital_portal;
```

Run migrations and seed data:

```bash
npm run migrate
npm run seed
```

You should see output ending in `Seed completed successfully.` The seed
script prints a generated super admin login — **note the email and password
it prints**, or set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env`
before seeding to choose your own.

Start the server:

```bash
npm run dev
```

It starts on `http://localhost:5000` by default. Check it's alive:

```bash
curl http://localhost:5000/api/health
```

## Useful scripts

```bash
npm run dev             # start with auto-reload (nodemon)
npm start                # start without auto-reload
npm run migrate          # apply pending migrations
npm run migrate:down     # roll back the most recent migration
npm run migrate:status   # show which migrations have been applied
npm run seed              # (re)seed roles/admin/categories/pages
```

## API documentation

See [`docs/API.md`](../docs/API.md) for the full endpoint reference.

## Project structure

```
server/
├── migrations/        SQL migration files + runner (run.js)
├── seeds/              Seed script (run.js)
├── src/
│   ├── config/         DB connection pool
│   ├── controllers/     Route handlers — thin, call repositories/services
│   ├── middleware/      auth, RBAC, validation, error handling
│   ├── repositories/     All raw SQL lives here, one file per table group
│   ├── routes/          Express routers, one file per module
│   ├── services/         Business logic that doesn't belong in a controller (auth)
│   ├── utils/            JWT helpers, slugify, storage abstraction, logger
│   └── validators/       express-validator chains per module
│   ├── app.js            Express app + middleware stack
│   └── server.js          Entry point
```

## What's NOT in this phase yet

This is the foundation. Still to come in later phases:
- The CMS admin panel (React UI for managing all this content)
- The converted public React frontend
- Cloudinary / S3 storage providers (stubbed in `src/utils/storage.js` — local
  disk works today)
- Email delivery for password reset (the token is generated and stored, but
  not emailed anywhere yet — see the `TODO` note in `authService.js`)
- BS↔AD date conversion helper
- Full Media Library UI (folders, tagging, search) — uploads currently just
  return a URL
- Analytics, SEO sitemap/robots.txt generation, menu builder, advertisements,
  popups — these are backlog items per our MVP scoping discussion
