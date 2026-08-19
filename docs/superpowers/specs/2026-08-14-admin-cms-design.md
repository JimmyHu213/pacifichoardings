# Admin CMS — editable about page, company info, and multi-photo projects

**Date:** 2026-08-14
**Status:** Approved

## Goal

Extend the existing admin area into a CMS so the client can edit, without code
changes: the about page (text and photos), company information (contact
details, legal line, coverage), the small content lists (stats, clients,
compliance tags, testimonials), and project photo galleries. D1 stores the
data; the existing R2 bucket stores the images.

## What already exists (unchanged foundations)

- Session-based admin login guarding `/admin/*` (protected layout).
- Projects CRUD at `/admin/projects` with single-photo upload to the
  `pacifichoardings-project-images` R2 bucket (type allowlist, 5MB cap,
  orphan cleanup), FAQs CRUD, quotes inbox.
- Content layer `src/lib/content/index.ts`: async getters; projects and FAQs
  read D1 with a fallback on error; services/stats/testimonials/clients are
  static TS arrays.
- `/media/[...key]` serves any R2 key.

Services stay in static code — they are structural (slugs drive routing and
the quote form) and out of scope.

## Data model (D1)

All new tables are seeded by migration from today's live values, so the
cutover is invisible to visitors. Timestamps follow the existing
`created_at`/`updated_at` TEXT convention.

### `site_settings`

```sql
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

Namespaced keys, seeded with current values:

| Key | Seeded value (today) |
|---|---|
| `company.phone` | `02 4054 5107` |
| `company.email` | `admin@pacificgrp.com.au` |
| `company.yard_suburb` | `Morisset, NSW` |
| `company.hours` | `8am–4pm` |
| `company.legal_name` | `Pacific Hoarding Pty Ltd` |
| `company.abn` | `96 686 186 934` |
| `company.coverage` | `Servicing Sydney & the Central Coast` |
| `about.headline` | `One crew. One engineer. Every hoarding.` |
| `about.intro` | current intro paragraph |
| `about.who_heading` / `about.who_body` | current "Who we are" section |
| `about.compliant_heading` / `about.compliant_body` | current "Compliant is the minimum" section |
| `about.yard_body` | current yard paragraph |
| `about.crew_image` / `about.crew_image_alt` | absent until uploaded |
| `about.yard_image` / `about.yard_image_alt` | absent until uploaded |

Image values are R2 keys under an `about/` prefix in the existing bucket.
Absent image keys render the current placeholder frame.

### List tables

Each list follows the `faqs` pattern (integer autoincrement id unless noted,
`sort_order`, timestamps):

- `stats (id, value TEXT, label TEXT, detail TEXT, accent INTEGER, sort_order)`
- `clients (id, name TEXT, sort_order)`
- `compliance_tags (id, label TEXT, accent INTEGER, sort_order)`
- `testimonials (id, quote TEXT, source TEXT, sort_order)`

Seeded from `static/stats.ts`, `static/clients.ts`, the hardcoded about-page
tag row, and `static/testimonials.ts` respectively. The static files are
deleted once the getters read D1.

### `project_images`

```sql
CREATE TABLE project_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_key TEXT NOT NULL,
  image_alt TEXT,
  width INTEGER,
  height INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
```

Migration copies each project's existing `image_key`/`image_alt`/
`image_width`/`image_height` into `project_images` (where `image_key` is not
null), then drops those columns from `projects`. The image with the lowest
`sort_order` is the project's cover photo.

## R2

Reuse `pacifichoardings-project-images` (binding `PROJECT_IMAGES`). Project
photos keep their current key scheme; about photos use `about/<random>.<ext>`.
No new bucket, no new serving route — `/media/[...key]` already handles it.

## Admin UI

All pages live under the existing protected layout and follow the existing
server-action + form-component patterns. The dashboard gains links to each new
section.

- **`/admin/company`** — single form for the seven `company.*` fields, one
  Save button, upsert into `site_settings`.
- **`/admin/about`** — fill-in-the-blanks form for the `about.*` text fields
  plus two photo slots (crew, yard) with alt-text inputs. Photo uploads use
  the same validation as project photos; replacing a photo deletes the old R2
  object after a successful write.
- **`/admin/stats`**, **`/admin/testimonials`** — FAQ-style CRUD (list page,
  new/edit pages, delete, sort order).
- **`/admin/clients`**, **`/admin/compliance-tags`** — single-page editors
  (rows are one or two fields): add, delete and reorder inline.
- **`/admin/projects/[id]/edit`** — photo section replaces the single upload:
  lists the project's photos with thumbnail, alt text, delete and sort order;
  upload appends a new photo. Deleting a photo removes the R2 object.
  Deleting a project removes all its photos' R2 objects (extends the existing
  delete action).

The layout is never editable — the client fills fields; the design is fixed.

## Public rendering

`src/lib/content/index.ts`:

- New `getCompanyInfo()` and `getAboutContent()`; `getStats()`,
  `getClients()`, `getTestimonials()` switch from static arrays to D1;
  new `getComplianceTags()`.
- Every getter keeps the established failure mode: on D1 error, log and
  return the current hardcoded values (compiled-in fallback constants), so a
  database outage can never blank the header or footer.
- `getProjects()` joins `project_images` and returns `images[]` per project;
  the first image is the cover. A `getProject(slug)` getter backs the detail
  page.

Consumers:

- Header, mobile menu, footer, home contact block, quote form success message:
  render phone / email / hours / legal line / coverage from
  `getCompanyInfo()`. The site layout (a server component) calls
  `getCompanyInfo()` once and passes the values as props to the header and
  the mobile menu — the mobile menu is a client component and cannot fetch.
- About page renders entirely from `getAboutContent()` + list getters. Image
  slots show the uploaded photo or the existing placeholder frame.
- **New `/projects/[slug]` detail page**: title, detail line, timeframe,
  service tag, full description, all photos at native aspect ratio (existing
  `ProjectImage` component). Unknown slug → `notFound()`. Per-page
  `generateMetadata` from title + description. Cards on `/projects` link
  through.

## Error handling

At boundaries only, matching the codebase: upload validation in server
actions (type allowlist, 5MB), try/catch with fallback in content getters,
no orphaned R2 objects when a write fails, R2 cleanup on replace/delete.

## Delivery — two PRs

1. **`feat: project photo galleries and detail pages`** — `project_images`
   migration, admin multi-photo editing, `/projects/[slug]`, card links.
2. **`feat: editable company info, about page and content lists`** —
   `site_settings` + list tables, admin forms, consumers switched to getters.

Each PR: lint, `tsc --noEmit`, build, Playwright suite green before review.

## Testing

- Playwright: project card links to a detail page rendering title + photos;
  unknown project slug 404s; about page renders seeded D1 content; header and
  footer show the seeded phone/legal line; admin routes still redirect to
  login when unauthenticated (existing coverage).
- Existing nav/smoke specs updated only if selectors change.

## Out of scope

Services editing, block-based layout editing, draft/preview workflow, image
resizing/optimisation (photos are served as uploaded), multi-user roles.
