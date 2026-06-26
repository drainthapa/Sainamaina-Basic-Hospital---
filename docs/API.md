# API Reference — Phase 1

Base URL (local dev): `http://localhost:5000/api`

All responses follow this envelope:

```json
{ "success": true, "data": { ... }, "meta": { "total": 10, "limit": 20, "offset": 0 } }
```

Errors:

```json
{ "success": false, "message": "...", "errors": [ { "field": "email", "message": "..." } ] }
```

Authenticated routes require `Authorization: Bearer <accessToken>`.
Public GET routes work without a token, but return less (only published,
non-deleted rows) than the same route called with a valid CMS token.

## Roles

`super_admin`, `hospital_administrator`, `content_editor`, `doctor`,
`reception_staff`, `read_only` — seeded by `npm run seed`.

---

## Auth — `/api/auth`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/login` | none (rate-limited) | body: `{ email, password }`. Returns `accessToken` + sets `refresh_token` httpOnly cookie. |
| POST | `/refresh` | refresh cookie or body `refreshToken` | Rotates the refresh token, returns a new `accessToken`. |
| POST | `/logout` | refresh cookie or body `refreshToken` | Revokes the refresh token. |
| GET | `/me` | Bearer | Current user profile. |
| POST | `/change-password` | Bearer | body: `{ currentPassword, newPassword }`. Revokes all refresh tokens. |
| POST | `/forgot-password` | none (rate-limited) | body: `{ email }`. Always returns the same message (no account enumeration). |
| POST | `/reset-password` | none (rate-limited) | body: `{ token, newPassword }`. |

## Hospital services — `/api/services`

| Method | Path | Auth | Roles |
|---|---|---|---|
| GET | `/?department_id=...&category=...&emergency=true` | optional | public sees published only |
| GET | `/slug/:slug` | optional | |
| GET | `/:id` | Bearer | |
| POST | `/` | Bearer | super_admin, hospital_administrator |
| PUT | `/:id` | Bearer | super_admin, hospital_administrator |
| DELETE | `/:id` | Bearer | super_admin, hospital_administrator |

Covers OPD, IPD, Laboratory, Radiology, Pharmacy, Immunization, Maternal Care,
Child Health, Dental, Eye Care, Surgery, etc. — one table filtered by
`category` and `is_emergency`, optionally linked to a department.

## Departments — `/api/departments`

| Method | Path | Auth | Roles |
|---|---|---|---|
| GET | `/` | optional | public sees published only |
| GET | `/slug/:slug` | optional | |
| GET | `/:id` | Bearer | any logged-in CMS user |
| POST | `/` | Bearer | super_admin, hospital_administrator |
| PUT | `/:id` | Bearer | super_admin, hospital_administrator |
| DELETE | `/:id` | Bearer | super_admin, hospital_administrator (soft delete) |

Body fields: `name_en, name_np, description_en, description_np, image_url, sort_order, is_published`.
`slug` is generated automatically from `name_en`.

## Staff (Doctors + all staff) — `/api/staff`

| Method | Path | Auth | Roles |
|---|---|---|---|
| GET | `/?staff_type=doctor&department_id=...` | optional | filter by type/department |
| GET | `/:id` | optional | includes `schedules[]` |
| POST | `/` | Bearer | super_admin, hospital_administrator |
| PUT | `/:id` | Bearer | super_admin, hospital_administrator |
| DELETE | `/:id` | Bearer | super_admin, hospital_administrator |

`staff_type` ∈ `doctor, nursing, administrative, technical, support`.
Body may include `schedules: [{ day_of_week, start_time, end_time }]` (0=Sunday..6=Saturday)
— passing this on update fully replaces the staff member's schedule.

## News / Notices / Press Releases / Tender Notices / Health Articles / Events — `/api/news`

| Method | Path | Auth | Roles |
|---|---|---|---|
| GET | `/?module_type=notice&category_id=...&search=...&featured=true` | optional | public sees `status=published` only; CMS can pass `?status=draft` |
| GET | `/slug/:slug` | optional | increments view count for public requests |
| GET | `/:id` | Bearer | |
| POST | `/` | Bearer | super_admin, hospital_administrator, content_editor, reception_staff |
| PUT | `/:id` | Bearer | super_admin, hospital_administrator, content_editor |
| DELETE | `/:id` | Bearer | super_admin, hospital_administrator, content_editor |

`module_type` ∈ `news, notice, press_release, tender_notice, health_article, event, achievement`.
`status` ∈ `draft, published, archived`.

## Downloads (Acts/Policies/Guidelines/Forms/Budget/Reports/Publications/etc) — `/api/downloads`

| Method | Path | Auth | Roles |
|---|---|---|---|
| GET | `/?doc_type=policy&category_id=...&search=...` | optional | |
| GET | `/:id` | optional | |
| POST | `/:id/track` | none | call when the user actually clicks download; increments `download_count` |
| POST | `/` | Bearer | super_admin, hospital_administrator, content_editor |
| PUT | `/:id` | Bearer | super_admin, hospital_administrator, content_editor |
| DELETE | `/:id` | Bearer | super_admin, hospital_administrator, content_editor |

`doc_type` ∈ `act, policy, guideline, form, action_plan, budget_program, annual_report, other_report, publication, citizen_charter, unicode_download, other`.
Upload the file first via `/api/uploads`, then create the download record with the returned `file_url`.

## Gallery — `/api/gallery`

| Method | Path | Auth | Roles |
|---|---|---|---|
| GET | `/albums?album_type=photo` | optional | |
| GET | `/albums/:id` | optional | includes `media[]` |
| POST | `/albums` | Bearer | super_admin, hospital_administrator, content_editor |
| PUT | `/albums/:id` | Bearer | same |
| DELETE | `/albums/:id` | Bearer | same |
| POST | `/albums/:id/media` | Bearer | same — body `{ media: [{ media_url, media_type, caption_en, caption_np }] }` |
| DELETE | `/media/:mediaId` | Bearer | same |

## Content (Pages / FAQs / Settings / Categories) — `/api/content`

| Method | Path | Auth | Roles |
|---|---|---|---|
| GET | `/pages` | none | list of all pages (id, slug, title, updated_at) |
| GET | `/pages/:slug` | none | full content |
| PUT | `/pages/:slug` | Bearer | super_admin, hospital_administrator, content_editor |
| GET | `/faqs` | optional | |
| POST/PUT/DELETE | `/faqs[/:id]` | Bearer | super_admin, hospital_administrator, content_editor |
| GET | `/settings` | none | all site settings as a key→value object |
| PUT | `/settings/:key` | Bearer | super_admin, hospital_administrator — body `{ value }` |
| GET | `/news-categories?module_type=notice` | none | |
| POST | `/news-categories` | Bearer | super_admin, hospital_administrator |
| GET | `/download-categories?doc_type=policy` | none | |
| POST | `/download-categories` | Bearer | super_admin, hospital_administrator |

Default page slugs seeded: `history, mission, vision, objectives, organization-structure, citizen-charter, hospital-profile`.

## Uploads — `/api/uploads`

| Method | Path | Auth | Roles |
|---|---|---|---|
| POST | `/` (multipart, field name `file`) | Bearer | super_admin, hospital_administrator, content_editor |

Returns `{ file_url, file_name, file_size_kb, mime_type }`. Max 10MB by default
(`MAX_FILE_SIZE_MB` in `.env`). Allowed types: jpeg/png/gif/webp images, PDF,
Word, Excel, mp4/webm video.

Files are served back at `http://localhost:5000<file_url>` (e.g. `/uploads/169...-abc.pdf`).

## Users — `/api/users` (super_admin only)

| Method | Path | Notes |
|---|---|---|
| GET | `/` | List CMS users |
| GET | `/roles` | List roles (for the role dropdown) |
| POST | `/` | body: `{ email, password, fullName, phone?, roleId }` |
| PUT | `/:id/role` | body: `{ roleId }` |
| PUT | `/:id/active` | body: `{ isActive }` — also revokes that user's sessions when deactivating |
| DELETE | `/:id` | Soft delete; cannot delete your own account |

## Contact form submissions — `/api/contact-submissions`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/` | none (rate-limited, 10/15min) | body: `{ fullName, address?, email, message }` — the public contact page feedback form |
| GET | `/?unread=true` | Bearer | super_admin, hospital_administrator, reception_staff |
| PUT | `/:id/read` | Bearer | same roles |
| DELETE | `/:id` | Bearer | same roles |

---

## Example: log in and create a notice

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sainamainahospital.gov.np","password":"<your seeded password>"}'

# copy data.accessToken from the response, then:

curl -X POST http://localhost:5000/api/news \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{
    "title_en": "OPD reopens after renovation",
    "title_np": "ओपीडी पुन: सुरु",
    "module_type": "notice",
    "bs_date": "१४ फागुन २०७७"
  }'
```
