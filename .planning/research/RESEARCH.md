# Pacific Hoardings — Full-Site Research Report

Status: draft for team review. Written by the researcher agent. Decision-oriented — see each section's **Recommendation** callout.

---

## 1. Project map (current state)

**Stack**: Next.js 16.2.6 (App Router), React 19.1.7, Tailwind 4 (via `@tailwindcss/postcss`, but the page is hand-styled with inline `style` objects, not Tailwind classes), TypeScript 5.7, deployed to Cloudflare Workers through `@opennextjs/cloudflare` 1.19.9. No router segments beyond `src/app/` root yet — it's a single route (`/`).

**Files**:
- `src/app/page.tsx` — the entire landing page, one file, ~790 lines. Server component (no `"use client"`), renders sections inline with a `CSSProperties`-object styling pattern rather than Tailwind utility classes or CSS modules.
- `src/app/layout.tsx` — root layout, loads two Google fonts (`Barlow`, `Barlow_Condensed`) as CSS variables, sets metadata (title/description only — no OpenGraph, no favicon beyond an SVG).
- `src/app/scroll-reveal.tsx` — client component, `"use client"`, mounts once and uses `IntersectionObserver` to add `.is-in` to every `.ph-reveal` element, staggering siblings 90ms apart via inline `transitionDelay`. Renders `null` — pure side-effect component.
- `src/app/quote-form.tsx` — client component, controlled form with local `submitted` state. **Not wired to any backend** — `onSubmit` just calls `preventDefault()` and flips UI state. No fetch, no server action, no persistence.
- `src/app/image-slot.tsx` — placeholder image-frame component (dashed/hatched background + centered caption) standing in for real photography.
- `src/app/globals.css` → imports `palette.css` + `theme.css`.
- `src/app/palette.css` — **single source of truth for color**. Six hand-set brand values (`--color-accent`, `--color-accent-2`, `--color-neutral`, `--color-bg`, `--color-surface`, `--color-text`) generate full 100–900 OKLCH tonal ramps via `oklch(from var(...) L calc(c * f) h)` relative-color syntax, plus derived shadows. Retheming = edit 6 values.
- `src/app/theme.css` — design tokens (font vars, spacing scale `--space-1..8`, radii) + component classes (`.btn`, `.field`/`.input`, `.card`, `.tag`, `.nav`, `.blueprint` frame with corner brackets, `.duotone` image treatment) + page-level keyframes (`ph-marquee`, `ph-grid-drift`, `ph-rise`) + the `.ph-reveal` reveal-transition class consumed by `scroll-reveal.tsx`.
- `wrangler.jsonc` — worker name `pacifichoardings`, `main: .open-next/worker.js`, `nodejs_compat` + `global_fetch_strictly_public` flags, `ASSETS` binding, an `IMAGES` binding (Cloudflare Image Resizing, currently unused by any code), a self-reference `WORKER_SELF_REFERENCE` service binding (used by OpenNext for ISR/ODB revalidation), observability enabled. **No D1, KV, or R2 bindings configured yet.**
- `next.config.ts` — near-default; only addition is `initOpenNextCloudflareForDev()` for local binding access in `next dev`.
- `open-next.config.ts` — not yet inspected in detail but present at repo root (standard OpenNext Cloudflare adapter config).

**Landing page sections** (in DOM order): absolute-positioned transparent nav over hero → hero (looping background video `/hero.mp4`, animated grid-drift overlay, gradient scrim, headline, 2 CTAs, client-logo marquee) → capability stats row (sticky left label + 4 stat rows) → services grid (6 cards: Class A, Class B, temp fencing, signage/wraps, design & certification, council permits) → "why builders call us back" split (image + copy + 4 compliance tags) → projects marquee rail (6 items, hover-to-pause) → testimonials (2, large pull-quote style) → FAQ (5 items, native `<details>`) → quote section (dark band, contact info + `QuoteForm` + footer).

**Design language**: "blueprint/technical drawing" aesthetic — hairline borders, corner registration marks (`Corners()` component), uppercase condensed headings, monospace-feel numeric labels (`fontFeatureSettings: 'tnum' 1`), duotone color-mix image overlays, kicker labels like "01 · Capability data". This vocabulary (corners, kickers, numbered sections, blueprint cards) should carry through to all new sub-pages for consistency.

**No Cloudflare bindings are wired into runtime code anywhere** — the `IMAGES` binding is declared but unused; there is no D1/KV/R2 in `wrangler.jsonc`. The quote form has no submission pathway. This is greenfield for the backend work.

---

## 2. Information architecture

### Reference sites reviewed

| Site | Nav pattern | Notable structure |
|---|---|---|
| [1300Hoarding](https://www.1300hoarding.com.au/) | Flat top-level: External / Internal / Banners / Accessories / About / Contact / Quote | Product-type nav (5 hoarding types as their own pages), guarantees section (quote in 1 business day), FAQ, downloadable catalogue, team-with-photos page |
| [Titan Hoardings](https://www.titanhoardings.com/) | Nested: **About Us** (Company, Why Titan, Testimonials, Gallery, Partners) / Hire / Buy / **Our Systems** (8+ system sub-pages incl. AS 4687 Certification as its own page) / Installers / Facts / Blog / Contact | Most elaborate IA of the three — dedicated Hire vs Buy split, a certification page as a trust/SEO asset, an "Installers" page (B2B channel page), a Blog |
| [Sitemax](https://sitemax.com.au/) | Flat: Containment / Signage / Site Services / Sustainability / About / Resources / Contact | Industry-vertical homepage sections (Developers/Construction/Industrial), featured single-project case study, "Resources" as a content hub |

### Recommended IA for Pacific Hoardings

Two-level nav, dropdown on **Services** only (the site's core money pages) plus flat top-level pages for everything else — mirrors Titan's win (systems get their own SEO-indexable pages) without Titan's over-nesting.

```
Home
Services ▾
  ├─ Class A Hoarding
  ├─ Class B Hoarding (Gantry)
  ├─ Temporary Fencing
  ├─ Signage & Graphics Wraps
  ├─ Design & Engineering Certification
  └─ Council Permits & Traffic Management
Projects            (gallery/portfolio, filterable)
About                (company, team, values, safety record)
Compliance & Safety   (AS 4687, SafeWork NSW, insurances — trust/SEO page)
Contact / Get a Quote (primary CTA, also in nav as a button)
[Phone number, always visible]
```

Why this shape, not Titan's full nesting: Pacific Hoardings has one core offering family (hoarding + adjacent site-protection services), not Titan's multi-brand catalogue (hire vs buy vs installers vs blog). A single **Services** dropdown keeps the six existing homepage service cards as their own indexable URLs without fragmenting the nav into 4+ top-level dropdowns a small trade business can't maintain content for.

### Per-page content blocks

**`/services/[slug]`** (6 pages, one per existing service card — reuse `services` array in `page.tsx:56-81` as the seed data):
- Hero band: service name, one-line value prop, breadcrumb (Home / Services / X), quote CTA
- "What it is" — expanded version of the existing card body copy
- "When you need it" — decision criteria (e.g., Class B: "required wherever work happens above a footpath that stays open")
- Spec/process block — install steps, typical timeline, certification included (blueprint-card grid, reusing `.blueprint`/`Corners()` pattern)
- Photo gallery strip (reuse `ProjectRail`/marquee pattern, filtered to this service type)
- Compliance tags (reuse existing `.tag` component: AS 4687, SafeWork NSW, etc.)
- Related services (cross-links to the other 5)
- FAQ subset (filter the existing `faqs` array by relevance, or a per-service FAQ list)
- Quote CTA band (reuse the dark `#quote` section pattern)

**`/projects`** (gallery/portfolio):
- Filter bar (by service type: Class A / Class B / Fencing / Signage; and/or by region)
- Grid of project cards (photo, title, detail line — extends the existing `projects` array, needs `image`, `serviceType`, `region`, maybe `date` fields)
- Optional: individual `/projects/[slug]` detail pages if the client wants full case studies (scope decision for the team — recommend starting with grid-only, add detail pages only if content volume justifies it)

**`/about`**:
- Company story / years operating
- Team (Titan does headshot + name + phone per region — good B2B trust pattern to borrow)
- Values / why-us (extend existing "Compliant is the minimum" section, `page.tsx:576-593`)
- Safety record stats (reuse the `stats` capability-data pattern from `page.tsx:49-54`)
- Client logos (reuse existing marquee, `ClientMarquee` component)
- Testimonials (reuse existing `testimonials` array/section)

**`/compliance`** (trust/SEO page — Titan's "AS 4687 Certification" as its own page is the model):
- AS 4687 explainer (what it is, why it matters)
- SafeWork NSW compliance statement
- Insurance/public liability figures ($20M — already in the existing tag)
- Engineering sign-off process
- Downloadable certs/insurance certificates (COI) — PDF links, likely stored in R2 (see §4)
- Council permit process explainer (folds in the existing "Council permits" service card content, cross-linked from Services)

**`/contact`** (or keep `#quote` as an anchor section reachable from every page's footer + nav CTA, and give it a real `/quote` route too for direct linking/ads):
- Full `QuoteForm` (wired to real backend — see §4)
- Phone/email/yard address (already present)
- Map embed (not currently present — consider a static map image over a live Google Maps embed to avoid third-party script weight)
- Response-time promise (1300Hoarding's "quote within 1 business day" pattern is a good trust builder — the existing hero already claims "24h" turnaround; keep it consistent)

---

## 3. Scroll animation approach

### Options compared

| Approach | Bundle cost | Cloudflare Workers/SSR fit | Ceiling |
|---|---|---|---|
| **Current: `scroll-reveal.tsx` (IntersectionObserver)** | 0 KB (native browser API) | Perfect — it's already a `"use client"` component, no SSR concerns, runs entirely post-hydration | Binary reveal only (fade+translateY on enter); no scroll-linked/scrubbed effects, no exit animations, manual stagger math |
| **Motion (`motion` npm package, formerly Framer Motion)** | 2.3 KB (mini) – 34 KB full; ~4.6 KB with `LazyMotion` + tree-shaken imports | Fine — it's a client-only library, ships no server code, works the same on Workers as any other host since OpenNext just runs the compiled Next.js output; needs `"use client"` boundaries same as any interactive component | Full spring physics, gesture support, `whileInView`, layout animations, scroll-linked (`useScroll`/`useTransform`) and scrubbed timelines — the "if we outgrow reveal-on-enter" ceiling |
| **CSS scroll-driven animations** (`animation-timeline: view()` / `scroll()`) | 0 KB JS | Perfect for SSR (pure CSS, works before hydration even) | Chrome/Edge shipped ~2024; **Safari only shipped support in 26 (2025)**, and per [Frontend Horizon's 2026 write-up](https://www.frontendhorizon.com/blog/view-transitions-api-and-css-scroll-driven-animations-the-browser-wins-of-2026) it's a "browser win of 2026" — i.e. still recent enough that a meaningful slice of visitors (older Safari/iOS, some Android WebViews) get no animation at all, not a broken one, since it degrades to the static end-state. No stagger primitive — would need `@property`/counter tricks or per-element `animation-delay` in CSS, more brittle than the current JS stagger loop |

### Recommendation: keep `scroll-reveal.tsx`, add Motion only where it earns its cost

Don't replace the existing IntersectionObserver reveal system wholesale. It already does the job the current page needs (fade-up on scroll, staggered), costs 0 bytes, and has zero Workers/SSR risk since Cloudflare Workers serving OpenNext output has no bearing on client-side animation code — the constraint that matters is bundle size and hydration cost, not the host.

Reasoning against the alternatives as full replacements:
- **CSS scroll-driven animations** are the "0 KB" dream, but Safari support only landed in 2025/26 — for a Sydney construction-industry audience (a lot of on-site mobile Safari/iOS usage), a no-JS-fallback approach risks silently flat pages for a real chunk of visitors. Worth adopting later once support is universal, not now.
- **Motion wholesale replacement** would add real KB for a capability (spring physics, gestures, layout animation) the current design doesn't use anywhere — every effect on the page today is a one-shot fade+rise, which IntersectionObserver already does perfectly.

Where Motion *is* worth pulling in as the site grows past this landing page: anything scroll-*linked* (not just triggered) — e.g. a parallax hero image, a progress-scrubbed timeline on a process/how-it-works page, or a mobile nav dropdown with gesture-quality open/close. Import it with `LazyMotion` + tree-shaken feature imports (`domAnimation`) to keep the added cost near the 4.6 KB floor, and keep `scroll-reveal.tsx` doing the bulk of the simple reveal work it already handles well. Don't introduce Motion until a specific new page actually needs scroll-linked (not just scroll-triggered) motion — e.g. a Services sub-page process timeline.

---

## 4. Backend / content architecture

The client wants **Cloudflare-native storage + a custom light admin portal — not a CMS product.** Recommendation below is scoped to that constraint.

### Storage: D1 for structured content + submissions, R2 for images/PDFs, KV only for small hot config

| Data | Store | Why |
|---|---|---|
| Page content (service copy, project entries, testimonials, FAQ, team bios) | **D1** | It's relational-ish (services ↔ projects ↔ FAQ tags), needs an admin UI to do CRUD with real queries/filtering (e.g. "projects where serviceType = Class B"), and D1 gives strong consistency + SQL — a KV key-per-record store would work but makes filtering/listing painful (KV has no query, only key lookup/list-by-prefix). [Community consensus](https://www.proptechusa.ai/news/cloudflare-workers-kv-vs-d1-performance-comparison) is D1 for anything needing relationships or complex queries, KV for simple config/session/cache. |
| Quote form submissions | **D1** (a `quotes` table) | Needs to be queryable/listable in the admin (mark as contacted, filter by date/service type), which is exactly D1's strength over KV. Optionally also fire a Cloudflare Email Routing / Resend notification on insert so the team doesn't have to check the admin portal to catch new leads. |
| Photos (hero video excluded — that stays a static asset), project gallery images, uploaded quote-request attachments, downloadable compliance PDFs | **R2** | Object storage is the right tool for binary blobs; R2 has zero egress fees which matters once the gallery has real photography. Serve through the already-configured `IMAGES` binding (`wrangler.jsonc:22-26`) for on-the-fly resize/format-negotiation — [OpenNext's docs](https://opennext.js.org/cloudflare/howtos/image) confirm the `IMAGES` binding is exactly for this and recommend restricting transformable origins to your own R2 bucket for security. |
| Feature flags / small hot singletons (e.g. "site under maintenance", nav config) | **KV** — only if/when this need actually arises | Not needed at launch; don't add it speculatively. |

Practical note: D1 has a free-tier row/read cap generous enough for a single small-business marketing site (low thousands of rows, low-thousands of daily reads) — no cost concern here.

### Admin portal: custom Next.js routes + session-cookie auth, not Cloudflare Access

Recommend a `/admin` route group in the same Next.js app (not a separate worker), gated by a simple server-side session check, backed by D1 for the user table (or literally a single hardcoded admin credential via a Workers secret if there's only ever 1-2 users — this is a small trade business, not a multi-tenant SaaS).

Why not Cloudflare Access: Access is designed for gating access to internal tools by identity provider (Google Workspace/GitHub/etc SSO) sitting *in front of* the origin — it's excellent for "only people in our Google Workspace can reach /admin at all," but integrating it *with* Next.js's own session/auth model is awkward (Access issues its own JWT via a redirect flow that doesn't map cleanly onto Next.js server session cookies — confirmed pain point in the [next-auth Cloudflare Access discussion](https://github.com/nextauthjs/next-auth/discussions/5501)). For a single-business admin with a handful of named users, it's more moving parts than the problem needs.

Recommend instead:
1. A `users` table in D1 (email + hashed password, or even just one row) — use `bcrypt`/`scrypt`-equivalent hashing available in the Workers runtime (Web Crypto `SubtleCrypto`, since `bcryptjs` needs Node APIs — `nodejs_compat` is already on so either works, but Web Crypto avoids the dependency).
2. Login route sets an HTTP-only, `Secure`, `SameSite=Strict` session cookie containing a signed token (HMAC via Web Crypto, no external JWT library needed) or a session ID looked up in D1/KV.
3. `middleware.ts` (Next.js) or a layout-level server check on every `/admin/**` route redirects to `/admin/login` if the session cookie is missing/invalid.
4. This is the same shape as the [Cloudflare full-stack Next.js + D1 tutorial](https://developers.cloudflare.com/developer-spotlight/tutorials/fullstack-authentication-with-next-js-and-cloudflare-d1/) and the [ifindev/fullstack-next-cloudflare](https://github.com/ifindev/fullstack-next-cloudflare) reference template (D1 + R2 + Better Auth + Server Actions) — if the team wants to move faster than hand-rolling, **Better Auth** is a good middle ground: it's a small, edge-compatible auth library (not a hosted service, not Cloudflare Access) that works directly against D1 and would save the hand-rolled session/cookie plumbing without pulling in a heavy CMS-style dependency.

**Recommended stack**: D1 (content + submissions) + R2 (images/PDFs) + `IMAGES` binding (already declared) for resize/optimize + custom `/admin` route group in the existing Next.js app + Better Auth (or hand-rolled Web-Crypto session cookies if the team wants zero new dependencies) for login. No Cloudflare Access, no third-party CMS.

### Suggested next steps for the developer agent
1. Add `d1_databases` and `r2_buckets` bindings to `wrangler.jsonc`, run `wrangler d1 create` / `wrangler r2 bucket create`.
2. Design a minimal D1 schema: `services`, `projects`, `testimonials`, `faqs`, `quotes`, `users` (or start narrower — just `quotes` + `projects` if content editing isn't needed at launch and copy stays hardcoded in `page.tsx` a while longer).
3. Wire `quote-form.tsx`'s `onSubmit` to a Server Action or `/api/quote` route that inserts into D1 (this is the highest-value, lowest-effort win — the form currently does nothing).
4. Build `/admin` incrementally: quotes inbox first (read the leads the form is now capturing), then project/content CRUD once there's a content model worth editing through a UI rather than a code deploy.

---

## Sources consulted
- [1300Hoarding](https://www.1300hoarding.com.au/)
- [Titan Hoardings](https://www.titanhoardings.com/)
- [Sitemax Australia](https://sitemax.com.au/)
- [Motion for React docs](https://motion.dev/docs/react)
- [View Transitions API and CSS Scroll-Driven Animations: The Browser Wins of 2026 — Frontend Horizon](https://www.frontendhorizon.com/blog/view-transitions-api-and-css-scroll-driven-animations-the-browser-wins-of-2026)
- [Cloudflare Workers KV vs D1 performance comparison](https://www.proptechusa.ai/news/cloudflare-workers-kv-vs-d1-performance-comparison)
- [OpenNext Cloudflare — Image Optimization howto](https://opennext.js.org/cloudflare/howtos/image)
- [Cloudflare full-stack auth with Next.js + D1 tutorial](https://developers.cloudflare.com/developer-spotlight/tutorials/fullstack-authentication-with-next-js-and-cloudflare-d1/)
- [ifindev/fullstack-next-cloudflare reference template](https://github.com/ifindev/fullstack-next-cloudflare)
- [next-auth Cloudflare Access integration discussion](https://github.com/nextauthjs/next-auth/discussions/5501)
