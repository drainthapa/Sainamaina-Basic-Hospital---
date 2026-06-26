# CMS Admin Panel — Phase 2

React (Vite) admin dashboard for managing all hospital portal content. Talks
to the Phase 1 Express API.

## Setup

```bash
cd client/admin
npm install
cp .env.example .env
```

By default `.env` points at `http://localhost:5000/api` (the Phase 1 backend
running locally). Adjust if your backend runs elsewhere.

```bash
npm run dev
```

Opens on `http://localhost:5173`. Log in with the super admin credentials
printed by the backend's `npm run seed` command (see `server/README.md`).

## What's included

- Login / session handling with silent refresh-token renewal
- Role-aware sidebar navigation (menu items hide based on your role)
- **Dashboard** — at-a-glance counts across all modules
- **Departments** — full CRUD, image upload, publish toggle
- **Hospital services** — full CRUD, optional department link, emergency flag
- **Staff & doctors** — full CRUD, photo upload, weekly schedule editor,
  doctor-specific specialization field shown conditionally
- **News & notices** — tabbed by type (News / Notices / Press Releases /
  Tender Notices / Health Awareness / Events), rich text editor for body
  content, draft/published/archived workflow
- **Downloads** — covers Acts, Policies, Guidelines, Forms, Action Plans,
  Budget & Program, Annual Reports, Other Reports, Publications, Citizen
  Charter, Unicode Downloads — filtered by type, file upload built in
- **Gallery** — photo/video albums with multi-file upload and per-item
  removal
- **Pages** — rich text editor for the static About/History/Mission/etc
  pages
- **FAQs** — simple inline add/edit/delete list
- **Settings** — site name, contact info, social links (super_admin /
  hospital_administrator only)
- **Users** — create CMS accounts, change roles, activate/deactivate,
  delete (super_admin only)

## Role-based visibility

The sidebar and route guards hide pages a role can't use, but this is a
UX convenience — the real enforcement happens in the backend (every write
endpoint checks the role server-side regardless of what the admin UI shows).

## What's NOT included yet

- Menu Builder, Advertisements, Popups, Analytics dashboard, Audit Log
  viewer, full Media Library browser (uploads work; there's no
  folder/tag/search UI over previously-uploaded files yet)
- Bulk actions (bulk delete/publish)
- Image cropping/optimization on upload — files are stored as uploaded

These were intentionally left for a later phase per the MVP scoping
discussion — ask if you'd like any of them prioritized next.
