# Phase 10 plan — admin content management (projects, FAQs, R2 images)

Design-first, no implementation yet. Covers the rendering-strategy decision, what
becomes editable, the D1 schema, the R2 image flow, the admin UI, and a
commit-sized task breakdown for when this gets built.

---

## 1. The rendering-strategy decision

### The four options, and what each actually costs

**(a) Fully dynamic** — content getters read D1 directly on every request; pages
that use them stop being statically prerendered and render on every hit.

**(b) ISR + on-demand revalidation** — pages stay statically cached; an admin
save calls `revalidateTag`/`revalidatePath` to invalidate just the affected
page. Per OpenNext's Cloudflare adapter docs, this requires: an R2 bucket for
the incremental cache, a Durable Object queue (`DOQueueHandler`) for
time-based revalidation, a tag cache (`D1NextTagCache` or
`DOShardedTagCache`) to track what's stale, and the self-reference service
binding (already present). Each of these needs its own wrangler.jsonc
wiring — DO classes need `migrations` entries (a different mechanism from D1
migrations), the tag cache needs its own binding, and `open-next.config.ts`
needs the three overrides wired together.

**(c) Static TS stays the source of truth, admin edits require a redeploy** —
doesn't actually solve "edit content through a UI and see it live," which is
the point of this phase. Ruled out unless paired with something like an
admin-save-triggers-a-git-commit-and-CI-redeploy pipeline — a much heavier,
differently-scoped mechanism (GitHub PAT as a Workers secret, git operations
from within a Server Action, 1–3 minute latency to go live) that nothing in
the brief asked for. Not recommended.

**(d) Hybrid — D1-first with static fallback + revalidateTag** — keeps all of
option (b)'s infrastructure and adds a fallback code path on top of it. Doesn't
remove any of ISR's complexity; only adds more.

### Recommendation: (a), fully dynamic D1 reads

For this site's actual traffic profile (a small NSW trade contractor, not a
high-traffic consumer product), the performance gap between "cached static
HTML" and "Worker + a same-region D1 read" is real but small — D1 reads are
typically single-digit-to-low-double-digit milliseconds, and the included
D1 read allowance (5M/day free tier, 25B/month on paid) isn't something this
site will get near. Weighed against that marginal cost, option (b) asks us to
introduce Durable Objects, a second R2 bucket, and three new binding types
purely to shave a few milliseconds off pages that update maybe a few times a
month. That's a bad trade for a site this size — more moving parts, more ways
to misconfigure a binding, more surface to debug when something's stale.

Fully dynamic also has a real *freshness* advantage over ISR: content changes
are visible on the very next request, with no revalidation window and no
dependency on every admin save action remembering to call `revalidateTag`
with the right tag (miss one, and content goes silently stale until someone
notices).

This is also exactly what the content layer was built for. Every getter in
`src/lib/content/index.ts` has been `async` since phase 2 specifically "so a
later swap to D1/KV reads doesn't touch call sites" — phases 2 through 9 already
paid down 100% of the design cost this decision needs. Swapping `getProjects()`
and `getFaqs()` to D1 queries touches exactly those two functions; every page
that calls them (home, `/projects`, `/compliance`, each service page's FAQ
subset) needs zero changes.

**This isn't a one-way door.** If traffic ever grows enough that per-request D1
reads become a real cost, option (b) is a well-defined upgrade layered *under*
the same getters — the async-getter architecture doesn't change, only what's
inside the `try` block does.

**One architectural consequence worth naming:** `SiteHeader` (rendered from
`(site)/layout.tsx`) already calls `getServices()` for the nav. Since services
are staying in static TS (see §2), the layout itself doesn't force the whole
site dynamic. But once *any* page's own getter reads D1 (e.g. `/projects`
calling `getProjects()`), that specific route loses static prerendering —
under option (a) this is expected and accepted, not a bug to work around.

**Testing implication:** admin content pages, `/projects`, and any page
rendering an FAQ subset will need `getCloudflareContext({ async: true })` (the
sync-mode restriction and the async-mode fix are already established from
phases 8–9) — and under plain `next start` (no Cloudflare bindings at all,
same situation the quote form hits in the existing throwaway-config test
runs), those D1 reads will fail. Recommend `getProjects()`/`getFaqs()` catch a
missing-binding error and return `[]` rather than throwing — a few lines,
keeps the existing throwaway `next-start` test path from hard-crashing on
pages it doesn't have bindings for, and doubles as graceful degradation if D1
ever has a bad moment in production.

---

## 2. What becomes editable

| Content | Editable? | Why |
|---|---|---|
| **Projects** | Yes | The one thing that genuinely changes over time for a trade business — new completed jobs, new photos. Flat-ish schema, low risk to hand to a non-technical editor. Biggest ROI for a light CMS, and the natural home for the R2 image requirement. |
| **FAQs** | Yes | Three fields (id/question/answer), trivial schema, plausible the business wants to add/remove questions without a dev. |
| **Quote inbox** | Already built (phase 9) | No change here. |
| **Services** | No — stays in static TS | Deeply nested schema (specs[], process[], images[], complianceTags[], faqIds[]) — building a safe generic-form editor for that shape is disproportionate UI work versus the other two, and the six service types are stable, rarely-changing business offerings, not the kind of content that needs frequent hands-on editing. Matches your own instinct in the brief. Addable later with the identical pattern (a `services` table + child tables or JSON columns) if real demand shows up — not designing that now. |
| **Testimonials, stats, client list** | No — stays in static TS | Same shape/cost as FAQ, but nobody asked for it and it's not blocking anything. Cheap to add later using the FAQ CRUD as a template. Deliberately not scope-creeping this in. |

**One cross-reference risk to flag:** `Service.faqIds: string[]` (static,
unchanged) references FAQ `id`s like `"council-approval"`. Once FAQs move to
D1, the *content* of a question/answer can be edited freely, but the `id`
needs to stay stable for that static cross-reference to keep resolving.
Recommend: seed D1 with the exact same ids currently in `static/faqs.ts`, make
`id` admin-settable only at creation (auto-slugified from the question,
editable once before the first save) and read-only afterward. If an admin
later deletes an FAQ a service still references, the existing
`faqs.filter(f => service.faqIds.includes(f.id))` call on service pages
already degrades gracefully — that service's FAQ section just shows fewer
questions, not an error. Acceptable risk for an internal tool; not worth
building FK-style validation for.

---

## 3. D1 schema

Same database as phase 8 (`env.DB` / `pacifichoardings-db`) — no reason to
split a site this size across multiple D1 databases. Two new tables, two new
migration files following the existing `migrations/0001_*.sql` convention,
each migration creating *and seeding* its table so the cutover from static TS
to D1 is invisible (the admin's first login shows the same six projects and
five FAQs that are live today, not an empty table).

**`migrations/0002_create_projects.sql`**
```sql
CREATE TABLE IF NOT EXISTS projects (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	slug TEXT UNIQUE NOT NULL,
	title TEXT NOT NULL,
	detail TEXT NOT NULL,
	service_slug TEXT NOT NULL,   -- matches a static Service.slug; no FK, services aren't a D1 table
	timeframe TEXT NOT NULL,
	description TEXT NOT NULL,
	image_key TEXT,                -- R2 object key; NULL until a photo is uploaded
	image_alt TEXT,
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order);

-- seeded with the current 6 static/projects.ts rows (image_key/image_alt NULL —
-- existing placeholder copy moves to image_alt for continuity, no image_key
-- until someone uploads a real photo through the new admin UI)
```

**`migrations/0003_create_faqs.sql`**
```sql
CREATE TABLE IF NOT EXISTS faqs (
	id TEXT PRIMARY KEY,   -- kebab-case, stable — see the cross-reference note in §2
	question TEXT NOT NULL,
	answer TEXT NOT NULL,
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_faqs_sort_order ON faqs(sort_order);

-- seeded with the current 5 static/faqs.ts rows, same ids
-- (council-approval, class-a-vs-class-b, install-speed, certification, branding-print)
```

**Content types** (`src/lib/content/types.ts`): `Project.image` changes shape
from `{ placeholder, label }` to `{ key: string | null; alt: string | null }`
— the getter maps D1's `image_key`/`image_alt` columns onto it. `Faq` gains no
new fields (`id`/`q`/`a` already match). Both getters keep their existing
`Promise<Project[]>` / `Promise<Faq[]>` signatures.

---

## 4. R2 image upload flow

**New binding** (wrangler.jsonc): `r2_buckets: [{ binding: "PROJECT_IMAGES",
bucket_name: "pacifichoardings-project-images" }]` — distinct name from the
existing `images: { binding: "IMAGES" }` block, which is OpenNext's *Cloudflare
Images optimization* binding (on-the-fly resize/format-negotiation for
`next/image`, not storage) — not the same thing, easy to conflate. Like the D1
`database_id` placeholder in phase 8, the real bucket needs `wrangler r2
bucket create pacifichoardings-project-images` run against the account before
a remote deploy — R2 local emulation under `--local`/`preview` works off the
bucket *name* string alone, so this doesn't block any local build/test work,
same as D1's placeholder didn't.

**Upload:** the project edit form includes a file input. On save, a Server
Action receives the `File` via `FormData` (this is an authenticated
admin-only action, not a public endpoint, so no need for presigned URLs or
Direct Creator Upload — those solve for public/high-volume uploads, which
this isn't), validates content-type (`image/*`) and a size cap (~5MB),
computes a key like `projects/${slug}-${Date.now()}.${ext}`, and calls
`env.PROJECT_IMAGES.put(key, arrayBuffer, { httpMetadata: { contentType } })`.
The timestamp suffix means a replacement upload gets a new key rather than
overwriting the old one — sidesteps cache invalidation entirely (the old key
gets explicitly deleted from R2 after the D1 row updates successfully, so
nothing is orphaned).

**Serving:** a same-origin route handler, `src/app/media/[...key]/route.ts`,
reads `env.PROJECT_IMAGES.get(key)` and returns the bytes with the stored
content-type and `Cache-Control: public, max-age=31536000, immutable` (safe
because keys are never reused). Same-origin means no custom R2 domain or DNS
setup is needed, and `next/image` pointed at `/media/projects/xyz.jpg` still
gets transformed by the existing `IMAGES` optimization binding same as any
other same-origin image.

**Rendering:** the existing `ImageSlot` placeholder component is untouched —
still used as-is on service pages, About, and Compliance. A new small
component (`ProjectImage`) renders a real `<Image src="/media/...">` when
`project.image.key` is set, and falls back to the current `ImageSlot`
placeholder treatment when it's `null` — covers the seeded projects that
haven't had a real photo uploaded yet.

---

## 5. Admin UI

Promoting `/admin` from "the quote inbox" to a small dashboard, since there's
now more than one admin section:

- `/admin` — landing page, links to Quotes / Projects / FAQs.
- `/admin/quotes` — the existing inbox, moved here unchanged (mechanical route
  move, not a rewrite).
- `/admin/projects` — list (thumbnail, title, service, timeframe, sort order,
  edit/delete) + "New project."
- `/admin/projects/new`, `/admin/projects/[id]/edit` — form: title, slug
  (auto-suggested from title, editable), detail, service (`<select>` sourced
  from the static services list — just an enum, since services aren't a D1
  table), timeframe, description, image upload, sort order.
- `/admin/faqs` — list (question preview, sort order, edit/delete) + "New
  FAQ."
- `/admin/faqs/new`, `/admin/faqs/[id]/edit` — form: question, answer, sort
  order (`id` shown read-only when editing, per §2).

All CRUD via Server Actions following the exact pattern established in phase
9 (plain-check validation, no zod; the same session-guard layout already
protects everything under `admin/(protected)/`). Delete is a plain confirm
step, not a modal — staying consistent with "don't build a design system."
Reuses the `.table` CSS from phase 9 for the list views; forms reuse
`.field`/`.input`/`.btn` from theme.css, same as the quote form and login
form.

---

## 6. Task breakdown (commit-sized, in order)

1. **R2 bucket + image serving plumbing** — `r2_buckets` binding,
   `src/app/media/[...key]/route.ts`, a small `src/lib/r2-images.ts` helper
   (put/delete/build-key). No admin UI yet; verify with a manual R2 put +
   curl against the served route.
2. **D1 schema for projects + FAQs** — migrations 0002 and 0003, each
   creating and seeding its table from the current static data. No app code
   changes; verify via `wrangler d1 execute --local`.
3. **Swap `getProjects()`/`getFaqs()` to D1 reads** — content layer only,
   plus the `Project.image` type change. Highest-regression-risk commit in
   this phase — needs a careful before/after visual check of every page that
   renders projects or an FAQ subset (home, `/projects`, `/compliance`, each
   service page).
4. **Admin quotes route promotion** — `/admin` (protected) → `/admin/quotes`,
   new minimal `/admin` dashboard. Small, isolated, mechanical.
5. **Admin FAQ CRUD** — list + new/edit forms + create/update/delete actions.
6. **Admin project CRUD (text fields only)** — list + new/edit forms +
   actions, service `<select>` from static data. No image handling yet.
7. **Admin project image upload** — wire the file input into the project
   form, R2 put/delete on save, swap in `ProjectImage` on the public
   `/projects` page.
8. **Polish pass** — empty-state copy, delete-confirmation UX, sort-order
   input usability check.

Each phase verified the same way as 4–9: lint, build (confirm which routes
now show `ƒ Dynamic` vs stayed static), full test suite via the throwaway
`next-start` config, and an end-to-end `npm run preview` check against local
D1 + R2 for anything touching bindings.
