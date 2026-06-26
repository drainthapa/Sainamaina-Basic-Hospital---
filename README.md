# Sainamaina Basic Hospital Portal — PERN Stack Project

सैनामैना आधारभुत अस्पताल | सैनामैना नगरपालिका

This repository will hold the full hospital web portal: a public-facing
multilingual (Nepali/English) website plus a CMS admin panel, built on
PostgreSQL + Express + React + Node.

## Status: Phases 1–3 built

| Phase | Status | Contents |
|---|---|---|
| 1. Backend foundation | ✅ Done | PostgreSQL schema, migrations, seed data, JWT auth + RBAC, REST APIs for every MVP content module including Services, Users, and Contact submissions |
| 2. CMS admin panel | ✅ Done | React admin UI with full CRUD for every module |
| 3. React frontend conversion | ✅ Mostly done | Layout, homepage, and all core listing/detail pages converted; a handful of secondary pages still follow the established pattern but aren't filled in (see `client/public/README.md`) |
| 4. Polish & deploy | Not started | SEO, analytics, deployment guide, remaining backlog modules |

## Structure

```
hospital-portal/
├── client/
│   ├── legacy-static/    Your original HTML/CSS/JS frontend, unmodified — kept as the
│   │                     reference design source. Its assets/ folder is the source of
│   │                     truth copied into client/public/public/assets/.
│   ├── admin/            Phase 2: the CMS admin panel (React + Vite). See client/admin/README.md.
│   └── public/           Phase 3: the converted public website (React + Vite). See
│                         client/public/README.md.
├── server/                The Phase 1 Express + PostgreSQL backend. See server/README.md
│                          for setup instructions.
├── uploads/                Local file storage for uploaded documents/images (gitignored in
│                          a real repo; created automatically by the server).
└── docs/
    └── API.md             Full REST API reference for everything built so far.
```

## Running everything locally

Three things need to run at once during development:

```bash
# Terminal 1 — backend
cd server && npm install && npm run migrate && npm run seed && npm run dev

# Terminal 2 — CMS admin
cd client/admin && npm install && npm run dev

# Terminal 3 — public website
cd client/public && npm install && npm run dev
```

The backend serves the API on :5000. Vite will put the admin panel and
public site on different ports automatically (check each terminal's output)
since both default to 5173 and Vite increments on conflict.

## MVP scope (agreed)

Rather than building all ~30 CMS modules from the original spec at once, the
schema and APIs were scoped to a real MVP first:

**Departments · Hospital Services · Staff & Doctors · News (covers
News/Notices/Press Releases/Tender Notices/Health Articles/Events) ·
Downloads (covers Acts/Policies/Guidelines/Forms/Action Plans/Budget/Annual
Reports/Publications/Citizen Charter) · Gallery · Pages (About/History/
Mission/etc) · FAQs · Site Settings · Users · Contact form submissions**

Everything else from the original spec (full Media Library UI, Menu Builder,
Analytics dashboard, Advertisements, Popups, multi-language translation
tables beyond the en/np pair, Cloudinary/S3 storage, BS↔AD calendar
conversion, email delivery) is tracked as backlog for later phases rather
than built speculatively now — see the "What's NOT in this phase yet" section
of `server/README.md`.

## Why the schema differs from the original brief in places

The original spec assumed separate modules for things like "Doctors" vs
"Staff", and separate modules for "Acts", "Policies", "Annual Reports",
"Tender Documents", etc. After reviewing your actual uploaded HTML pages,
most of these turned out to be the *same* underlying content shape (a
title + date + optional file, or a name + designation + photo), just
displayed on different listing pages. Collapsing them into fewer tables with
a `type` column means less duplicate CMS code to build and maintain, without
losing any ability to show separate pages on the public site — each public
page just filters by its type.

Full reasoning and the entity relationship diagram were discussed at the
start of this build; ask if you'd like that diagram regenerated.
