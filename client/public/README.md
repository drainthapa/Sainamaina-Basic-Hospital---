# Public Website — Phase 3

React (Vite) conversion of the original static HTML frontend, wired to the
Phase 1 API instead of hardcoded content. Visual design (CSS, fonts, layout
classes) is carried over from the original `assets/` folder unchanged —
see `public/assets/`.

## Setup

```bash
cd client/public
npm install
cp .env.example .env
npm run dev
```

Opens on `http://localhost:5174` (or whatever Vite picks if 5173 is taken by
the admin app — run them side by side, they don't conflict).

## What's converted so far

- **Full bilingual support (English / Nepali)** with a toggle in the header
  utility bar. UI labels are translated via `src/i18n/`; data fields (titles,
  names, descriptions, etc.) automatically switch via the `field()` helper
  in `LanguageContext`, which picks `_en`/`_np` based on the active language
  and falls back to whichever language has content so partially-translated
  CMS entries never show blank. Preference persists in `localStorage`.
- **Layout**: Header (utility bar with font-size/print/invert-color/BS date/
  language toggle, logo banner, dropdown nav) and Footer (contact info,
  related government links, embedded map, copyright bar) — ported from the
  real markup in `news.html`, not the stale `header.html`/`footer.html`
  template files (verified those aren't actually used by any current page)
- **Homepage**: marquee notice ticker, hero image slider, VIP members
  sidebar, e-governance quick links, intro section, tabbed document
  carousel (Policy/Act/Guideline/Action Plan), photo gallery preview
- **News & notices**: list + detail pages, shared across all 6 content
  types (News, Notices, Press Releases, Tender Notices, Health Awareness,
  Events) via one set of components and a `:type` URL param
- **Downloads**: list page covering all document types, with download-count
  tracking
- **Hospital services**: list page (OPD, IPD, Laboratory, etc.), grouped by
  emergency vs regular
- **Staff & doctors**: directory table + detail page with schedule display
- **Departments**: grid + detail page showing assigned staff
- **Gallery**: album grid + album detail with a modern lightbox for photos,
  native `<video>` for video albums
- **Contact**: address/phone/map plus a working feedback form that posts to
  the backend
- **FAQs**: accordion list
- **Site map**: auto-generated from the same nav data structure the header
  uses, so it can never drift out of sync
- **About pages**: generic CMS-page renderer for Introduction, History,
  Objectives, Organization Structure (and any other slug-based page you add
  in the CMS)

## What replaced what (and why)

| Original | Replacement | Why |
|---|---|---|
| jQuery + FlexSlider (hero) | Swiper (`HeroSlider.jsx`) | Actively maintained, React-native, same fade/autoplay behavior |
| jQuery + OWL Carousel (doc tabs, gallery preview) | Swiper | One library instead of two; consistent API |
| jQuery Fancybox (lightbox) | `yet-another-react-lightbox` | Modern, accessible, React-native |
| `<marquee>` tag (notice ticker) | CSS `@keyframes` animation | `<marquee>` is deprecated/unsupported; same visual scroll, same hover-to-pause |
| Manual BS date strings | `nepali-date-converter` | Real AD↔BS conversion instead of guessing; also lets the CMS auto-derive a BS date display if an editor only fills in the AD date |

CSS is untouched except for the FlexSlider/OWL/Fancybox/jQuery-UI plugin
stylesheets, which were intentionally **not** copied over since their
JS is gone — `style.css`, `custom.css`, `responsive.css`, and `bootstrap.css`
(the files that actually carry the site's visual identity) are loaded as-is
in `index.html`.

## What's NOT converted yet

A handful of the original 29 pages don't have a dedicated route yet:
righttoinformation.html, regulatons.html, publications.html (separate from
the `publication` download type), form.html (the special online-application
form mentioned as commented-out in the nav), and a few of the more obscure
report pages. These all follow the exact same pattern as the pages that
are done — copy `DownloadListPage.jsx` or `StaticPage.jsx` and point it at
the right `doc_type` or page slug. Ask if you'd like these filled in next.
