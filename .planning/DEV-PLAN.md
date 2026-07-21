# Pacific Hoardings — technical implementation plan

Scope: turn the single-page demo (`src/app/page.tsx`) into a multi-page marketing
site with dropdown nav, scroll-reveal animations throughout, a typed content data
layer that can move to Cloudflare D1/KV without page rewrites, and a lightweight
`/admin` CMS. This document is planning only — no source files have been touched.

Stack as found: Next.js 16 (App Router), React 19, Tailwind 4 (installed but
dormant — see §3), `@opennextjs/cloudflare` for the Workers build, no D1/KV/R2
bindings configured yet in `wrangler.jsonc`. Current page is 100% inline
`style={{}}` objects plus a hand-rolled CSS token system in `palette.css` /
`theme.css` (OKLCH ramps, `.btn`, `.blueprint`, `.ph-reveal`, nav hover states).
`ScrollReveal` is a client component that IntersectionObserver-tags `.ph-reveal`
elements; `QuoteForm` is a client component with a fake local-state submit.

---

## 1. Route structure

Two route groups under `src/app/`: `(site)` for the public marketing site
(unprefixed URLs) and `admin/` for the CMS (real `/admin` prefix, deliberately
not a route group since the URL segment is meaningful).

```
src/app/
  layout.tsx                    # root: <html>/<body>, fonts, metadata only
  globals.css / palette.css / theme.css
  (site)/
    layout.tsx                  # SiteHeader + {children} + Footer
    page.tsx                    # home — today's content, moved as-is
    services/
      page.tsx                  # index/grid of all services
      [slug]/page.tsx           # one service detail, generateStaticParams from data layer
    projects/
      page.tsx                  # gallery index
      [slug]/page.tsx           # project detail
    compliance/
      page.tsx                  # AS 4687, licensing, insurance detail
    about/
      page.tsx
    contact/
      page.tsx                  # standalone quote form + contact details
  admin/
    layout.tsx                  # admin shell + auth gate, no site Nav/Footer
    login/page.tsx
    page.tsx                    # dashboard
    quotes/page.tsx             # submissions inbox
    content/page.tsx            # edit services/about/compliance copy
    projects/
      page.tsx                  # gallery list
      [id]/page.tsx             # edit one project + photo upload
  api/
    quote/route.ts              # public POST — quote submissions
    admin/
      auth/route.ts
      content/route.ts
      projects/route.ts
      quotes/route.ts
src/components/                 # shared UI reused across ≥2 routes
  site-nav.tsx
  nav-dropdown.tsx
  mobile-menu.tsx
  site-footer.tsx
  scroll-reveal.tsx             # moved from src/app/
  quote-form.tsx                # moved from src/app/
  image-slot.tsx                # moved from src/app/
src/lib/
  style-tokens.ts                # shared inline-style objects (see §3)
  content/
    types.ts
    index.ts                     # async getters, static-backed today
    static/
      services.ts projects.ts faqs.ts testimonials.ts stats.ts clients.ts nav.ts
```

Route-local, single-use components (e.g. a `ProjectCard` only `projects/`
ever renders) stay co-located inside their route folder rather than moving to
`src/components/` — matches CLAUDE.md §9 (co-locate, avoid deep nesting) while
still centralizing anything shared.

## 2. Shared layout: nav + footer, dark vs light, dropdowns

**Nav variant.** Today's nav is absolutely positioned, transparent, light text
over the hero video — that only makes sense on the home page. Every other page
is a normal light-themed page and needs a static, solid, sticky header with dark
text, like the rest of the site.

Rather than have every page remember to pass a variant prop, `SiteHeader` (in
`(site)/layout.tsx`) is a client component that reads `usePathname()` and picks
`overlay` (transparent, `--color-bg`-on-dark, absolutely positioned — home only)
vs `solid` (sticky, `--color-bg` background, `--color-text` foreground —
everywhere else). Two variants is enough; nothing else in scope has a full-bleed
hero. This keeps page files free of layout concerns.

**Footer.** The current footer is two lines of legal text jammed inside the
quote section — fine for one page, not a real site footer. Extract a proper
`SiteFooter` (nav link columns mirroring the dropdown structure, phone/email,
the existing ABN/legal line) and render it once from `(site)/layout.tsx` below
`{children}`. The home page's quote section keeps its content but stops owning
the `<footer>` tag.

**Dropdown menu — disclosure pattern, no new dependency.** Implement
`NavDropdown` using the W3C APG "disclosure navigation" pattern rather than a
full ARIA `role="menu"` widget: a `<button aria-expanded aria-controls>` next to
a plain `<ul>` of links. This is deliberately simpler than roving-tabindex
`role="menu"` — Tab/Shift+Tab moves through it like any other links, Enter/Space
toggles the button, Escape and click-outside close it. It's the standard,
easy-to-get-right pattern for exactly this "nav item with a few links under it"
case; a full menu-button widget is overkill here and easy to get wrong.

- State: one `open` boolean per top-level item (`useState`), closed by Escape
  (`keydown` listener while open), outside click (`pointerdown` + `ref.contains`
  check), and route change (`useEffect` on `usePathname()`).
- Desktop also opens on `mouseenter` / closes on `mouseleave` with a ~150ms
  delay, layered on top of the same click-toggle state so it still works with
  keyboard/touch alone.
- Mobile: nav collapses behind a hamburger `<button aria-expanded
  aria-controls="mobile-menu" aria-label="Menu">` driving `MobileMenu`, a
  slide-down panel. Dropdown sections inside it reuse the identical
  `NavDropdown` disclosure component as inline accordions — no second
  implementation.
- Styling stays in `theme.css` as new classes (`.nav-dropdown`, `.nav-panel`,
  `.nav-hamburger`), consistent with how `.ph-nav-link` etc. already work —
  not inline styles, since this needs `:hover`/`:focus-visible`/media queries.
- Nav link + dropdown data comes from `src/lib/content/static/nav.ts` (typed
  `NavLink[]`, optional `children`), not hardcoded in the component, so the
  admin phase can eventually edit it without touching `NavDropdown`.

No Radix/Headless UI/etc. — the disclosure pattern is ~100–150 lines of
plain React and keeps the dependency footprint at zero, per the brief.

## 3. Styling strategy: keep inline styles + CSS classes, don't migrate to Tailwind

**Decision: keep the current hybrid — inline `style={{}}` objects for one-off
layout/typography values, CSS classes in `theme.css` for anything inline can't
express (hover, pseudo-elements, animation, media queries).** Do not migrate
existing or new pages to Tailwind utility classes.

Why:
- Tailwind is imported (`@import "tailwindcss"` in `globals.css`) but nothing
  in the codebase uses its utility classes today — the actual design system is
  the hand-rolled OKLCH token ramp in `palette.css`/`theme.css`. Introducing
  Tailwind utilities alongside it would mean two competing styling paradigms in
  the same files, or plumbing Tailwind's theme config to re-point at the same
  custom properties for no functional gain.
- Migrating ~800 lines of already-correct, pixel-tuned inline styles is a pure
  refactor with no user-facing benefit — CLAUDE.md §3 (surgical changes, don't
  refactor what isn't broken) argues against it.
- Most of the inline values (`clamp()` responsive type, specific gaps) are
  one-off and don't repeat across sections, so Tailwind's main advantage
  (deduplicating repeated utility strings) doesn't clearly apply here.

**What does need to change as the site grows:** the same style objects
(`kicker`, `sectionTitle`, `bodyCopy`, `pageGutter`, `rise()`) are currently
defined at the top of `page.tsx` and would otherwise be copy-pasted into every
new page file. Extract them once into `src/lib/style-tokens.ts` and import from
every page — still the inline-style pattern, just de-duplicated at the module
level instead of switching to a different styling paradigm. This is
extracting genuinely-repeated code, not a speculative abstraction.

## 4. Content data layer

Goal: pages read typed content through async getter functions today backed by
static arrays; swapping the getter body to a D1/KV read later doesn't touch any
page.

```ts
// src/lib/content/types.ts
export interface Service { slug: string; title: string; body: string }
export interface Project { slug: string; title: string; detail: string; /* ...image ref later */ }
export interface Faq { q: string; a: string }
export interface Testimonial { quote: string; source: string }
export interface NavLink { label: string; href: string; children?: NavLink[] }

// src/lib/content/index.ts
export async function getServices(): Promise<Service[]> { return services; }
export async function getServiceBySlug(slug: string): Promise<Service | undefined> { ... }
export async function getProjects(): Promise<Project[]> { ... }
// etc.
```

Every getter is `async` from day one even though it just returns a static
array today — that's the entire trick. Call sites are already `await
getServices()` inside async Server Components, so when the body becomes
`await env.DB.prepare(...).all()` (D1) or `await env.CONTENT_KV.get(key,
"json")` (KV), nothing above the data layer changes.

Storage split (decision to act on in Phase 6, not now): **D1** for anything
relational/queryable — `projects`, `services`, `quote_submissions` (admin needs
to list/sort/filter these). **KV** for small singleton blobs — page copy like
the about/compliance body text, fetched by a fixed key. **R2** for project
photo binaries, with D1 storing the R2 object key. Don't wire any of this yet —
building unused bindings now would be speculative (CLAUDE.md §2); the async-getter
shape is what makes deferring it safe.

`QuoteForm`'s submit handler already isolates the fake `setSubmitted(true)` in
one place, so swapping it for a real `fetch("/api/quote", { method: "POST" })`
call in Phase 6 is a contained change, not a rewrite.

## 5. Phasing (small, conventional-commit PRs)

1. **`refactor: extract shared nav and footer into (site) layout`** — pull nav
   markup into `SiteHeader`/`site-nav.tsx` (no dropdowns yet, same links as
   today, overlay-only variant), pull footer into `SiteFooter`, add `(site)`
   route group + layout, move `page.tsx` in unchanged otherwise. Verify: build
   passes, homepage is visually identical.
2. **`refactor: extract page content into typed data layer`** — move `stats`,
   `services`, `projects`, `testimonials`, `faqs`, `clients` out of `page.tsx`
   into `src/lib/content/static/*` + `types.ts` + async getters; `page.tsx`
   becomes an async Server Component. Verify: build passes, visual diff
   identical.
3. **`feat: add accessible dropdown nav and mobile menu`** — build
   `NavDropdown` + `MobileMenu`, add `nav.ts` link data, wire `SiteHeader` to
   use them, add the solid/light nav variant (needed starting next phase). CSS
   additions in `theme.css`. Verify: keyboard-only pass (Tab/Enter/Escape),
   manual mobile viewport check.
4. **Sub-pages, one PR each** — `feat: add /services pages`, `feat: add
   /projects pages`, `feat: add /compliance page`, `feat: add /about page`,
   `feat: add /contact page`. Each uses `style-tokens.ts`, the solid nav
   variant, `ScrollReveal`/`.ph-reveal` for consistency. Verify per page: build,
   internal links resolve, basic a11y check.
5. **`feat: extend scroll reveal animations to sub-pages`** — any additional
   scroll-driven treatment beyond the existing fade/rise (e.g. staggered
   reveals on the services/projects grids) reusing `.ph-reveal` infrastructure;
   add new keyframes to `theme.css` only if needed. Verify:
   `prefers-reduced-motion` still respected (already handled globally).
6. **`feat: wire content data layer to D1 and KV`** — add bindings to
   `wrangler.jsonc`, D1 migrations for `projects`/`services`/
   `quote_submissions`, a KV namespace for singleton page copy, swap
   `content/index.ts` getter bodies to read from them, add `POST /api/quote`
   writing to D1 and wire it into `QuoteForm`. Verify: `wrangler dev` locally,
   submit a test quote, confirm the row lands in D1.
7. **`feat: add admin portal skeleton with auth gate`** — `admin/layout.tsx` +
   `admin/quotes` listing real D1 submissions. Recommend gating `/admin` with
   Cloudflare Access rather than hand-rolled auth — it's a config-only,
   low-code way to get real authentication in front of the portal without
   building and maintaining a login/session system ourselves; flag this as a
   decision for whoever scopes this phase in detail. Verify: unauthenticated
   requests are blocked, quotes list shows real data.
8. **`feat: add admin content and gallery editing`** — forms to edit
   services/about/compliance copy and CRUD the project gallery (R2 upload for
   photos, D1 row per project). Verify: edit a service in admin, confirm it
   renders on the public page.

Each phase is independently buildable and shippable; later phases don't block
on earlier ones being "perfect," only merged.
