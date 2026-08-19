# Admin CMS expansion — left-nav layout, services editing, compliance page

**Date:** 2026-08-19
**Status:** Approved by Jimmy
**Extends:** `2026-08-14-admin-cms-design.md` (still authoritative for company
info, about page, content lists, and project galleries — nothing there
changes except where this document says so)

## Goal

Let the client edit most of the website from the admin panel, and give the
admin panel a left-sidebar layout that scales to the section count. This
document adds three parts to the approved CMS design: the sidebar layout,
services editing, and compliance-page editing.

## Part 1 — Admin layout: left sidebar (PR 0)

Rework `src/app/admin/(protected)/layout.tsx` from the top header bar into a
left sidebar:

- **Structure:** brand block at top; nav groups **Inbox** (Quotes) and
  **Content** (Dashboard link sits above the groups; Projects and FAQs now,
  and each CMS section as it lands: Company, About, Services, Compliance,
  Stats, Testimonials, Clients); pinned at the bottom, **View site** (links
  to `/`, opens in a new tab) and the existing **Log out** button.
- **Active state:** the current section is highlighted. Nav links live in a
  small client component (`admin-nav.tsx`) using `usePathname`; the layout
  stays a server component and passes the link list down.
- **Responsive:** below a narrow-screen breakpoint the sidebar collapses to
  a compact top bar (brand + hamburger); the hamburger slides the same nav
  in as an overlay drawer. The drawer closes on link click. This follows the
  existing public `mobile-menu.tsx` pattern.
- **Styling:** existing tokens and inline-style idiom; no new styling
  system, no component library.

The auth guard, metadata, and `logoutAction` wiring are unchanged. Existing
admin pages need no changes — only the shell around `{children}` moves.

## Part 2 — Already approved (unchanged)

Delivered as designed in `2026-08-14-admin-cms-design.md`:

- **Project photo galleries** + public `/projects/[slug]` detail pages
  (implementation plan: `2026-08-14-project-photo-galleries.md`).
- **Company info, about page, stats, clients, compliance tags,
  testimonials** via `site_settings` + list tables.

Two amendments from this document:

- The `company.phone` seed value is now `1300 722 477` (changed 2026-08-19).
- The `compliance_tags` list is **shared** between the about page and the
  compliance page (Part 4), seeded with the union of both pages' current
  tag rows: `AS 4687 certified`, `SafeWork NSW compliant`,
  `$20M public liability`, `Licensed installers`.

## Part 3 — Services editing (new PR)

### Scope rule

The four services are **fixed entities**: the client edits their content but
cannot add, delete, or rename slugs. Slugs (`class-a-hoarding`,
`class-b-hoarding`, `design-certification`, `council-permits`) drive routing,
internal links, and the quote form — creating or removing a service stays a
code change.

### Data model

One D1 table, seeded by migration from `src/lib/content/static/services.ts`:

```sql
CREATE TABLE services (
  slug TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,            -- card copy on / and /services
  tagline TEXT NOT NULL,
  overview TEXT NOT NULL,
  when_you_need_it TEXT NOT NULL,
  specs TEXT NOT NULL,           -- JSON: [{label, detail}] (4 rows)
  process TEXT NOT NULL,         -- JSON: [{step, detail}] (4 rows)
  compliance_tags TEXT NOT NULL, -- JSON: [string]
  faq_ids TEXT NOT NULL,         -- JSON: [string] — NOT editable in the UI
  images TEXT NOT NULL,          -- JSON: [{key, alt}] (2 slots; key "" = placeholder)
  updated_at TEXT NOT NULL
);
```

The spec-card and process-step lists are fixed-shape editable groups, not
queryable data — JSON text columns, not child tables. `faq_ids` stays in the
seed so service pages keep their FAQ links, but the admin UI does not expose
it.

### Admin UI

- `/admin/services` — list of the four services linking to
- `/admin/services/[slug]/edit` — one form: all text fields, the four
  spec-card label/detail pairs, the four process step/detail pairs, tag
  labels, and two photo slots with alt text (same validation as project
  photos: type allowlist, 5MB cap; R2 keys under `services/<slug>/`;
  replacing a photo deletes the old object after a successful write).

### Public rendering

- `getServices()` / `getService(slug)` in `src/lib/content` read D1 and fall
  back to the static array on error (the established failure mode). The
  static file stays as the compiled-in fallback — it is no longer the source
  of truth but is not deleted.
- Service pages render photos from the two slots, placeholder frame when a
  slot's key is empty (exactly like the about-page slots).
- **Quote form coupling:** the service dropdown on the quote form derives
  its options from service titles (`getServices()`), plus the fixed
  "Not sure yet — advise me" option. Server-side validation in
  `submitQuote` checks the submitted type against the same list instead of
  the hardcoded `QUOTE_TYPES` array. Existing quote submissions keep the
  title text they were submitted with — no back-fill.

## Part 4 — Compliance page editing (new PR)

All editable content on `/compliance` moves into `site_settings` under a
`compliance.*` namespace, seeded from today's hardcoded values:

| Key | Content |
|---|---|
| `compliance.headline` | `Compliant is the minimum` |
| `compliance.intro` | hero paragraph |
| `compliance.standards_body` | "Engineered to standard" paragraph |
| `compliance.standards_cards` | JSON `[{label, detail}]` — the 4 AS-spec cards |
| `compliance.permits_body` | council permits paragraph |
| `compliance.safework_body` | SafeWork NSW paragraph |
| `compliance.insurance_body` | insurance paragraph |
| `compliance.handover_body` | "What you get" intro paragraph |
| `compliance.handover_cards` | JSON `[{label, detail}]` — the 4 handover cards |
| `compliance.permit_image` / `.permit_image_alt` | photo slot (R2 key under `compliance/`) |
| `compliance.crew_image` / `.crew_image_alt` | photo slot |

- The tag row renders the shared `compliance_tags` list (Part 2 amendment).
- The FAQ section already reads D1 — unchanged.
- Admin UI: one `/admin/compliance` form, same pattern as `/admin/about`
  (text fields, two fixed 4-row card groups, two photo slots).
- Public page reads a `getComplianceContent()` getter with the current
  hardcoded values as fallback constants.

## Delivery order

| PR | Content | Plan |
|---|---|---|
| PR 0 | Left-sidebar admin layout + View site link | to be written (next) |
| PR 1 | Project photo galleries + detail pages | `2026-08-14-project-photo-galleries.md` (exists) |
| PR 2 | Company info, about page, lists | to be written when reached |
| PR 3 | Services editing | to be written when reached |
| PR 4 | Compliance page editing | to be written when reached |

Each PR goes through the normal CodeRabbit + human review flow with lint,
`tsc --noEmit`, unit tests, build, and the Playwright suite green. The
sidebar's nav list gains links as each section's pages land.

## Testing

- **PR 0:** Playwright — sidebar shows the nav sections and View site link
  when authenticated pages render; existing admin login specs stay green.
  (Admin pages beyond the login screen have no authenticated e2e coverage
  today; that stays out of scope.)
- **PR 3:** Playwright — a service page renders seeded D1 content; the
  quote form dropdown shows the four titles + "Not sure yet".
- **PR 4:** Playwright — compliance page renders seeded D1 content.
- Content getters keep compiled-in fallbacks; a D1 outage can never blank a
  public page.

## Out of scope (unchanged)

Adding/removing services, editing service slugs or FAQ links, draft/preview
workflow, block-based layout editing, image optimization, multi-user roles.
