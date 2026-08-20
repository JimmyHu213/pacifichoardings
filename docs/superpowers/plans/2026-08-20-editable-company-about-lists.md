# Editable Company Info, About Page & Content Lists Implementation Plan (CMS PR 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The client edits company contact details, every about-page text section and its two photos, and the stats/clients/compliance-tags/testimonials lists from the admin panel; the public site renders it all from D1 with compiled-in fallbacks.

**Architecture:** One migration adds `site_settings` (key/value) plus four list tables, seeded with today's live values so the cutover is invisible. `src/lib/content` gains `getCompanyInfo()`, `getAboutContent()`, `getComplianceTags()` and switches `getStats()`/`getClients()`/`getTestimonials()` to D1 — every getter falls back to constants in a new `fallbacks.ts` on error. Public consumers (header, mobile menu, footer, home contact block, quote-form success, about page) render from the getters. Six new admin sections follow the existing FAQ/projects server-action patterns.

**Tech Stack:** Next.js 16 App Router, Cloudflare D1 + R2 (existing `PROJECT_IMAGES` bucket), existing admin form patterns. No new dependencies.

**Specs:** `docs/superpowers/specs/2026-08-14-admin-cms-design.md` + amendments in `docs/superpowers/specs/2026-08-19-admin-cms-expansion-design.md` (Part 2).

## Global Constraints

- Branch: `feat/editable-content` off `main`. **PR #25 (phone number) must be merged into main first** — it touches the same hardcoded strings this PR replaces. Verify with `git log main --oneline -5 | grep -q "phone" || echo "MERGE #25 FIRST"`.
- Seeds must equal today's live values so nothing visibly changes at cutover. `company.phone` seeds as `1300 722 477` (spec amendment). Timestamps use the existing `created_at`/`updated_at` ISO-string convention (`new Date().toISOString()`).
- Every public getter fail-safe: on D1 error, `console.error` and return the fallback constants — a D1 outage can never blank the header or footer.
- The layout is never editable — the client fills fields; headings/kickers that are layout ("Track record", "The yard", "Who we work with") stay hardcoded. Editable: the fields listed in the spec's `site_settings` table plus the four lists.
- Photo uploads reuse the project rules verbatim: allowlist `image/jpeg|png|webp|avif|gif`, 5MB cap, fresh timestamped R2 key (never reused), old object deleted only after D1 commits, failed write deletes the fresh upload. About keys: `about/<slot>-<Date.now()>.<ext>` in the existing `PROJECT_IMAGES` bucket.
- The shared `compliance_tags` list seeds with the union (in this order): `AS 4687 certified` (accent), `SafeWork NSW compliant`, `$20M public liability`, `Licensed installers`.
- Admin pages follow the existing patterns exactly: server pages + `"use server"` actions files + client form components, `.field`/`.input`/`.btn` classes, tabs, double quotes, error-message tone of `faqs/actions.ts`.
- Nav links are added to `NAV_GROUPS` in `src/app/admin/(protected)/layout.tsx` ONLY in the task that creates the pages they point to.
- Conventional Commits. Never touch `main`. Shell note: prefix every node/npm/npx command with `NODE_OPTIONS= `.
- Verification per task: `NODE_OPTIONS= npx tsc --noEmit`, `NODE_OPTIONS= npm run lint`; full suite (`test:unit`, Playwright `npm test`) in the final task.
- D1 local database name: `pacifichoardings-db`. Apply migrations locally only (`--local`); remote apply is a post-merge deploy step.

---

### Task 1: Migration — site_settings, list tables, seeds

**Files:**
- Create: `migrations/0007_create_site_content.sql`

**Interfaces:**
- Produces (used by Tasks 2, 4–6): tables `site_settings(key, value, updated_at)`, `stats(id, value, label, detail, accent, sort_order, created_at, updated_at)`, `clients(id, name, sort_order, created_at, updated_at)`, `compliance_tags(id, label, accent, sort_order, created_at, updated_at)`, `testimonials(id, quote, source, sort_order, created_at, updated_at)` — all seeded.

- [ ] **Step 1: Write the migration**

Create `migrations/0007_create_site_content.sql`:

```sql
-- Editable site content: company info + about page copy live in a key/value
-- settings table; the small content lists get FAQ-style tables. Everything
-- is seeded with today's live values so the D1 cutover is invisible to
-- visitors. Image values in site_settings are R2 keys; the about.*_image
-- keys are intentionally NOT seeded (absent key renders the placeholder).
CREATE TABLE site_settings (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

INSERT INTO site_settings (key, value, updated_at) VALUES
	('company.phone', '1300 722 477', '2026-08-20T00:00:00.000Z'),
	('company.email', 'admin@pacificgrp.com.au', '2026-08-20T00:00:00.000Z'),
	('company.yard_suburb', 'Morisset, NSW', '2026-08-20T00:00:00.000Z'),
	('company.hours', '8am–4pm', '2026-08-20T00:00:00.000Z'),
	('company.legal_name', 'Pacific Hoarding Pty Ltd', '2026-08-20T00:00:00.000Z'),
	('company.abn', '96 686 186 934', '2026-08-20T00:00:00.000Z'),
	('company.coverage', 'Servicing Sydney & the Central Coast', '2026-08-20T00:00:00.000Z'),
	('about.headline', 'One crew. One engineer. Every hoarding.', '2026-08-20T00:00:00.000Z'),
	('about.intro', 'Pacific Hoardings designs, certifies and installs site hoardings for builders, developers and government across NSW — the same crew and the same engineer from the first site walk to the day it comes down.', '2026-08-20T00:00:00.000Z'),
	('about.who_heading', 'Who we are', '2026-08-20T00:00:00.000Z'),
	('about.who_body', 'We started as a hoarding installer and became the crew builders call when the paperwork matters as much as the panels. Every job still runs the same way — one crew stands it, one engineer signs it, and the same point of contact answers the phone from quote to dismantle.', '2026-08-20T00:00:00.000Z'),
	('about.compliant_heading', 'Compliant is the minimum', '2026-08-20T00:00:00.000Z'),
	('about.compliant_body', 'Anyone can stand a fence. We design and certify every hoarding to AS 4687, walk it past council before the first panel goes up, and keep it standing through the wind study, the inspection and eighteen months of the public leaning on it. Compliant is the floor we build from, not the ceiling we aim for.', '2026-08-20T00:00:00.000Z'),
	('about.yard_body', 'Every panel and gantry goes out of the same Morisset yard, measured and staged against the site plan before the truck leaves. It''s also where the paperwork gets filed — one address for the whole job.', '2026-08-20T00:00:00.000Z'),
	('about.crew_image_alt', 'Pacific Hoardings crew on site', '2026-08-20T00:00:00.000Z'),
	('about.yard_image_alt', 'Pacific Hoardings yard, Morisset', '2026-08-20T00:00:00.000Z');

CREATE TABLE stats (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	value TEXT NOT NULL,
	label TEXT NOT NULL,
	detail TEXT NOT NULL,
	accent INTEGER NOT NULL DEFAULT 0,
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

INSERT INTO stats (value, label, detail, accent, sort_order, created_at, updated_at) VALUES
	('A + B', 'Classes installed', 'Fence-type and overhead gantry', 0, 0, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('AS 4687', 'Certified to', 'Engineer-signed on every job', 1, 1, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('0', 'Failed inspections', 'Across every council we work in', 1, 2, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z');

CREATE TABLE clients (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

INSERT INTO clients (name, sort_order, created_at, updated_at) VALUES
	('Harbourline Constructions', 0, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('Westgate Civil', 1, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('Meridian Developments', 2, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('Stonefield Group', 3, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('Axiom Build', 4, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('Port & Pier Projects', 5, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('Crestline Developers', 6, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('NSW Public Works', 7, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z');

CREATE TABLE compliance_tags (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	label TEXT NOT NULL,
	accent INTEGER NOT NULL DEFAULT 0,
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

INSERT INTO compliance_tags (label, accent, sort_order, created_at, updated_at) VALUES
	('AS 4687 certified', 1, 0, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('SafeWork NSW compliant', 0, 1, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('$20M public liability', 0, 2, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('Licensed installers', 0, 3, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z');

CREATE TABLE testimonials (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	quote TEXT NOT NULL,
	source TEXT NOT NULL,
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL,
	updated_at TEXT NOT NULL
);

INSERT INTO testimonials (quote, source, sort_order, created_at, updated_at) VALUES
	('“They had the Class B up over the footpath in a weekend — certified, lit, and signed off by council before we''d finished demo.”', '— Site manager, tier-one builder, Sydney', 0, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z'),
	('“Quote on Tuesday, hoarding standing Friday. The graphics wrap made the client happier than the building did.”', '— Development director, North Sydney', 1, '2026-08-20T00:00:00.000Z', '2026-08-20T00:00:00.000Z');
```

- [ ] **Step 2: Apply locally and verify seeds**

```bash
NODE_OPTIONS= npx wrangler d1 migrations apply pacifichoardings-db --local
NODE_OPTIONS= npx wrangler d1 execute pacifichoardings-db --local --command "SELECT key, value FROM site_settings WHERE key LIKE 'company.%'; SELECT COUNT(*) AS stats FROM stats; SELECT COUNT(*) AS clients FROM clients; SELECT COUNT(*) AS tags FROM compliance_tags; SELECT COUNT(*) AS testimonials FROM testimonials;"
```

Expected: 7 company keys (phone `1300 722 477`), counts 3 / 8 / 4 / 2.

- [ ] **Step 3: Commit**

```bash
git add migrations/0007_create_site_content.sql
git commit -m "feat: add site_settings and content list tables with live-value seeds"
```

---

### Task 2: Content layer — fallbacks and getters

**Files:**
- Create: `src/lib/content/fallbacks.ts`
- Modify: `src/lib/content/types.ts` (add `CompanyInfo`, `AboutContent`, `ComplianceTag`)
- Modify: `src/lib/content/index.ts` (new getters; switch stats/clients/testimonials to D1)
- Delete: `src/lib/content/static/stats.ts`, `src/lib/content/static/clients.ts`, `src/lib/content/static/testimonials.ts` (their data moves to `fallbacks.ts`; `static/services.ts` STAYS — services are a later PR)

**Interfaces:**
- Produces (used by Tasks 3–6):
  - `interface CompanyInfo { phone: string; email: string; yardSuburb: string; hours: string; legalName: string; abn: string; coverage: string }`
  - `interface AboutContent { headline: string; intro: string; whoHeading: string; whoBody: string; compliantHeading: string; compliantBody: string; yardBody: string; crewImageKey: string | null; crewImageAlt: string; yardImageKey: string | null; yardImageAlt: string }`
  - `interface ComplianceTag { id: string; label: string; accent: boolean }`
  - `getCompanyInfo(): Promise<CompanyInfo>`, `getAboutContent(): Promise<AboutContent>`, `getComplianceTags(): Promise<ComplianceTag[]>`; `getStats()/getClients()/getTestimonials()` keep their existing signatures but read D1.
  - `getSiteSettings(prefix: string): Promise<Map<string, string>>` is internal to index.ts (not exported).

- [ ] **Step 1: Add the types**

Append to `src/lib/content/types.ts`:

```ts
export interface CompanyInfo {
	phone: string;
	email: string;
	yardSuburb: string;
	hours: string;
	legalName: string;
	abn: string;
	coverage: string;
}

export interface AboutContent {
	headline: string;
	intro: string;
	whoHeading: string;
	whoBody: string;
	compliantHeading: string;
	compliantBody: string;
	yardBody: string;
	/** R2 key served via /media; null renders the placeholder frame. */
	crewImageKey: string | null;
	crewImageAlt: string;
	yardImageKey: string | null;
	yardImageAlt: string;
}

export interface ComplianceTag {
	id: string;
	label: string;
	accent: boolean;
}
```

- [ ] **Step 2: Create the fallbacks module**

Create `src/lib/content/fallbacks.ts`:

```ts
// Compiled-in fallbacks for the D1-backed content getters. On any D1 error
// the getters log and return these, so an outage can never blank the header,
// footer or about page. Keep values in sync with migration 0007's seeds —
// they ARE those seeds, frozen at cutover.
import type { AboutContent, CompanyInfo, ComplianceTag, Stat, Testimonial } from "./types";

export const companyInfoFallback: CompanyInfo = {
	phone: "1300 722 477",
	email: "admin@pacificgrp.com.au",
	yardSuburb: "Morisset, NSW",
	hours: "8am–4pm",
	legalName: "Pacific Hoarding Pty Ltd",
	abn: "96 686 186 934",
	coverage: "Servicing Sydney & the Central Coast",
};

export const aboutContentFallback: AboutContent = {
	headline: "One crew. One engineer. Every hoarding.",
	intro: "Pacific Hoardings designs, certifies and installs site hoardings for builders, developers and government across NSW — the same crew and the same engineer from the first site walk to the day it comes down.",
	whoHeading: "Who we are",
	whoBody: "We started as a hoarding installer and became the crew builders call when the paperwork matters as much as the panels. Every job still runs the same way — one crew stands it, one engineer signs it, and the same point of contact answers the phone from quote to dismantle.",
	compliantHeading: "Compliant is the minimum",
	compliantBody: "Anyone can stand a fence. We design and certify every hoarding to AS 4687, walk it past council before the first panel goes up, and keep it standing through the wind study, the inspection and eighteen months of the public leaning on it. Compliant is the floor we build from, not the ceiling we aim for.",
	yardBody: "Every panel and gantry goes out of the same Morisset yard, measured and staged against the site plan before the truck leaves. It's also where the paperwork gets filed — one address for the whole job.",
	crewImageKey: null,
	crewImageAlt: "Pacific Hoardings crew on site",
	yardImageKey: null,
	yardImageAlt: "Pacific Hoardings yard, Morisset",
};

export const statsFallback: Stat[] = [
	{ value: "A + B", accent: false, label: "Classes installed", detail: "Fence-type and overhead gantry" },
	{ value: "AS 4687", accent: true, label: "Certified to", detail: "Engineer-signed on every job" },
	{ value: "0", accent: true, label: "Failed inspections", detail: "Across every council we work in" },
];

export const clientsFallback: string[] = [
	"Harbourline Constructions",
	"Westgate Civil",
	"Meridian Developments",
	"Stonefield Group",
	"Axiom Build",
	"Port & Pier Projects",
	"Crestline Developers",
	"NSW Public Works",
];

export const complianceTagsFallback: ComplianceTag[] = [
	{ id: "fallback-1", label: "AS 4687 certified", accent: true },
	{ id: "fallback-2", label: "SafeWork NSW compliant", accent: false },
	{ id: "fallback-3", label: "$20M public liability", accent: false },
	{ id: "fallback-4", label: "Licensed installers", accent: false },
];

export const testimonialsFallback: Testimonial[] = [
	{
		quote:
			"“They had the Class B up over the footpath in a weekend — certified, lit, and signed off by council before we'd finished demo.”",
		source: "— Site manager, tier-one builder, Sydney",
	},
	{
		quote: "“Quote on Tuesday, hoarding standing Friday. The graphics wrap made the client happier than the building did.”",
		source: "— Development director, North Sydney",
	},
];
```

- [ ] **Step 3: Rewrite the getters**

In `src/lib/content/index.ts`:

1. Remove the imports of `./static/clients`, `./static/stats`, `./static/testimonials` (KEEP `./static/services`).
2. Add `import { aboutContentFallback, clientsFallback, companyInfoFallback, complianceTagsFallback, statsFallback, testimonialsFallback } from "./fallbacks";`
3. Extend the type re-export line to: `export type { Stat, Service, Project, ProjectImage, Testimonial, Faq, CompanyInfo, AboutContent, ComplianceTag } from "./types";` and add `import type { AboutContent, CompanyInfo, ComplianceTag, Faq, Project, Stat, Testimonial } from "./types";`
4. Replace `getClients`, `getStats`, `getTestimonials` and add the new getters:

```ts
// Settings reads are prefix-scoped so company and about fetches stay cheap.
async function getSiteSettings(prefix: string): Promise<Map<string, string>> {
	const { env } = await getCloudflareContext({ async: true });
	const { results } = await env.DB.prepare("SELECT key, value FROM site_settings WHERE key LIKE ?")
		.bind(`${prefix}.%`)
		.all<{ key: string; value: string }>();
	return new Map(results.map((row) => [row.key, row.value]));
}

export async function getCompanyInfo(): Promise<CompanyInfo> {
	try {
		const s = await getSiteSettings("company");
		return {
			phone: s.get("company.phone") ?? companyInfoFallback.phone,
			email: s.get("company.email") ?? companyInfoFallback.email,
			yardSuburb: s.get("company.yard_suburb") ?? companyInfoFallback.yardSuburb,
			hours: s.get("company.hours") ?? companyInfoFallback.hours,
			legalName: s.get("company.legal_name") ?? companyInfoFallback.legalName,
			abn: s.get("company.abn") ?? companyInfoFallback.abn,
			coverage: s.get("company.coverage") ?? companyInfoFallback.coverage,
		};
	} catch (error) {
		console.error("Failed to load company info from D1", error);
		return companyInfoFallback;
	}
}

export async function getAboutContent(): Promise<AboutContent> {
	try {
		const s = await getSiteSettings("about");
		return {
			headline: s.get("about.headline") ?? aboutContentFallback.headline,
			intro: s.get("about.intro") ?? aboutContentFallback.intro,
			whoHeading: s.get("about.who_heading") ?? aboutContentFallback.whoHeading,
			whoBody: s.get("about.who_body") ?? aboutContentFallback.whoBody,
			compliantHeading: s.get("about.compliant_heading") ?? aboutContentFallback.compliantHeading,
			compliantBody: s.get("about.compliant_body") ?? aboutContentFallback.compliantBody,
			yardBody: s.get("about.yard_body") ?? aboutContentFallback.yardBody,
			crewImageKey: s.get("about.crew_image") ?? null,
			crewImageAlt: s.get("about.crew_image_alt") ?? aboutContentFallback.crewImageAlt,
			yardImageKey: s.get("about.yard_image") ?? null,
			yardImageAlt: s.get("about.yard_image_alt") ?? aboutContentFallback.yardImageAlt,
		};
	} catch (error) {
		console.error("Failed to load about content from D1", error);
		return aboutContentFallback;
	}
}

export async function getStats(): Promise<Stat[]> {
	try {
		const { env } = await getCloudflareContext({ async: true });
		const { results } = await env.DB.prepare("SELECT value, label, detail, accent FROM stats ORDER BY sort_order, id").all<{
			value: string;
			label: string;
			detail: string;
			accent: number;
		}>();
		return results.map((row) => ({ value: row.value, label: row.label, detail: row.detail, accent: row.accent === 1 }));
	} catch (error) {
		console.error("Failed to load stats from D1", error);
		return statsFallback;
	}
}

export async function getClients(): Promise<string[]> {
	try {
		const { env } = await getCloudflareContext({ async: true });
		const { results } = await env.DB.prepare("SELECT name FROM clients ORDER BY sort_order, id").all<{ name: string }>();
		return results.map((row) => row.name);
	} catch (error) {
		console.error("Failed to load clients from D1", error);
		return clientsFallback;
	}
}

export async function getComplianceTags(): Promise<ComplianceTag[]> {
	try {
		const { env } = await getCloudflareContext({ async: true });
		const { results } = await env.DB.prepare("SELECT id, label, accent FROM compliance_tags ORDER BY sort_order, id").all<{
			id: number;
			label: string;
			accent: number;
		}>();
		return results.map((row) => ({ id: String(row.id), label: row.label, accent: row.accent === 1 }));
	} catch (error) {
		console.error("Failed to load compliance tags from D1", error);
		return complianceTagsFallback;
	}
}

export async function getTestimonials(): Promise<Testimonial[]> {
	try {
		const { env } = await getCloudflareContext({ async: true });
		const { results } = await env.DB.prepare("SELECT quote, source FROM testimonials ORDER BY sort_order, id").all<{
			quote: string;
			source: string;
		}>();
		return results.map((row) => ({ quote: row.quote, source: row.source }));
	} catch (error) {
		console.error("Failed to load testimonials from D1", error);
		return testimonialsFallback;
	}
}
```

5. Delete `src/lib/content/static/stats.ts`, `src/lib/content/static/clients.ts`, `src/lib/content/static/testimonials.ts`.

- [ ] **Step 4: Verify nothing else imported the deleted files, then types/lint**

```bash
grep -rn "static/stats\|static/clients\|static/testimonials" src/ || echo "no stale imports"
NODE_OPTIONS= npx tsc --noEmit && NODE_OPTIONS= npm run lint
```

Expected: no stale imports; both clean. (`projects/actions.ts` imports `static/services` — untouched, still fine.)

- [ ] **Step 5: Commit**

```bash
git add -A src/lib/content
git commit -m "feat: D1-backed content getters for company, about and lists with fallbacks"
```

---

### Task 3: Public consumers render from the getters

**Files:**
- Modify: `src/app/(site)/layout.tsx` (fetch companyInfo, pass phone; force-dynamic)
- Modify: `src/components/site-header.tsx` (phone prop)
- Modify: `src/components/mobile-menu.tsx` (phone prop)
- Modify: `src/components/site-footer.tsx` (async, reads getCompanyInfo)
- Modify: `src/app/(site)/page.tsx` (contact block from getCompanyInfo; pass phone to QuoteForm)
- Modify: `src/app/(site)/quote-form.tsx` (phone prop for the success message + "in a hurry" line)
- Modify: `src/app/(site)/about/page.tsx` (render from getAboutContent + getComplianceTags; photo slots)

**Interfaces:**
- Consumes: Task 2 getters/types.
- Produces: `SiteHeader({ services, phone })`, `MobileMenu({ servicesItems, links, quoteHref, phone })`, `QuoteForm({ phone })` — all with `phone: string`. Each consumer computes the tel link inline as `` `tel:${phone.replace(/[^\d+]/g, "")}` `` — three call sites, trivial expression, no premature helper.

- [ ] **Step 1: Site layout fetches company info once**

Replace `src/app/(site)/layout.tsx` contents:

```tsx
import SiteHeader from "@/components/site-header";
import { getCompanyInfo, getServices } from "@/lib/content";

// Company info comes from D1 at request time; force-dynamic here keeps every
// (site) page's header/footer current instead of baking build-time values
// into statically-generated pages.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
	const [services, company] = await Promise.all([getServices(), getCompanyInfo()]);

	return (
		<>
			<SiteHeader services={services} phone={company.phone} />
			{children}
		</>
	);
}
```

- [ ] **Step 2: Header and mobile menu take the phone as a prop**

In `src/components/site-header.tsx`: change the signature to
`export default function SiteHeader({ services, phone }: { services: Service[]; phone: string })`,
replace the desktop phone anchor's `href="tel:1300722477"` with `` href={`tel:${phone.replace(/[^\d+]/g, "")}`} `` and its text `1300 722 477` with `{phone}`, and pass `phone={phone}` to `<MobileMenu ... />`.

In `src/components/mobile-menu.tsx`: add `phone` to the props type (`phone: string`), and replace the hardcoded phone anchor with:

```tsx
<a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="mobile-menu-link" onClick={() => setOpen(false)}>
	{phone}
</a>
```

- [ ] **Step 3: Footer reads company info itself**

Replace `src/components/site-footer.tsx` contents (it becomes an async server component; its two callers render it inside server pages, so nothing else changes):

```tsx
import { getCompanyInfo } from "@/lib/content";

export default async function SiteFooter() {
	const company = await getCompanyInfo();

	return (
		<footer
			style={{
				gridColumn: "1 / -1",
				paddingTop: 24,
				borderTop: "1px solid color-mix(in srgb, var(--color-bg) 22%, transparent)",
				fontSize: 13,
				lineHeight: "24px",
				color: "color-mix(in srgb, var(--color-bg) 65%, transparent)",
				display: "flex",
				flexWrap: "wrap",
				gap: "8px 32px",
				justifyContent: "space-between",
			}}
		>
			<span>
				{company.legalName} · ABN {company.abn}
			</span>
			<span>
				{company.yardSuburb} · {company.coverage}
			</span>
		</footer>
	);
}
```

- [ ] **Step 4: Home contact block + quote form**

In `src/app/(site)/page.tsx`: add `getCompanyInfo` to the existing `@/lib/content` import; fetch it in the page component alongside the existing data (add to the existing `Promise.all` or a new `const company = await getCompanyInfo();` where the other getters run). In the "quote desk" contact block replace the four hardcoded lines:

```tsx
<div>
	<strong style={{ fontWeight: 600 }}>Phone</strong> —{" "}
	<a href={`tel:${company.phone.replace(/[^\d+]/g, "")}`} style={{ color: "var(--color-accent-300)" }}>
		{company.phone}
	</a>
</div>
<div>
	<strong style={{ fontWeight: 600 }}>Email</strong> —{" "}
	<a href={`mailto:${company.email}`} style={{ color: "var(--color-accent-300)" }}>
		{company.email}
	</a>
</div>
<div>
	<strong style={{ fontWeight: 600 }}>Yard</strong> — {company.yardSuburb}
</div>
<div>
	<strong style={{ fontWeight: 600 }}>Hours</strong> — {company.hours}
</div>
```

and change `<QuoteForm />` to `<QuoteForm phone={company.phone} />`.

In `src/app/(site)/quote-form.tsx`: change the signature to `export default function QuoteForm({ phone }: { phone: string })` and the success message's hardcoded line to:

```tsx
<p style={{ fontSize: 13, lineHeight: "24px", margin: "16px 0 0", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
	In a hurry? Call <a href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a> now.
</p>
```

- [ ] **Step 5: About page renders from D1**

In `src/app/(site)/about/page.tsx`:

1. Imports: add `getAboutContent, getComplianceTags` to the `@/lib/content` import.
2. Fetch: `const [stats, clients, about, tags] = await Promise.all([getStats(), getClients(), getAboutContent(), getComplianceTags()]);`
3. Replace the hardcoded `<h1>` text with `{about.headline}`, the intro `<p>` text with `{about.intro}`, the "Who we are" kicker text with `{about.whoHeading}`, its paragraph with `{about.whoBody}`, the "Compliant is the minimum" kicker with `{about.compliantHeading}`, its paragraph with `{about.compliantBody}`, and the yard paragraph with `{about.yardBody}`. (The "About", "Track record", "The yard", "Who we work with", "Compliance" kickers and the stats-intro copy are layout — leave hardcoded.)
4. Replace the two `<ImageSlot ... />` figures so an uploaded photo renders and an absent key keeps the placeholder. Crew figure:

```tsx
<figure className="blueprint ph-reveal duotone" style={{ margin: 0 }}>
	{about.crewImageKey ? (
		<img
			src={`/media/${about.crewImageKey}`}
			alt={about.crewImageAlt}
			style={{ display: "block", width: "100%", height: "auto" }}
		/>
	) : (
		<ImageSlot placeholder="Drop a photo — the crew on site" label={about.crewImageAlt} />
	)}
	<Corners />
</figure>
```

Yard figure identically with `about.yardImageKey` / `about.yardImageAlt` and placeholder text `"Drop a photo — the yard, Morisset"`.

5. Replace the hardcoded compliance tag row with:

```tsx
{tags.map((tag) => (
	<span key={tag.id} className={tag.accent ? "tag tag-accent" : "tag tag-outline"}>
		{tag.label}
	</span>
))}
```

Note: `next lint` may warn about `<img>` vs `next/image` — this repo already serves R2 photos unoptimized by design (see PR #21); if the rule fires, use the same suppression/approach found in `src/components/project-image.tsx` rather than importing `next/image`.

- [ ] **Step 6: Verify**

```bash
NODE_OPTIONS= npx tsc --noEmit && NODE_OPTIONS= npm run lint && NODE_OPTIONS= npm test
```

All green — the Playwright suite runs against `next dev` with the local D1 seeded by Task 1, and seeds equal the old hardcoded values, so existing specs must pass unchanged. Then spot-check by eye: `NODE_OPTIONS= npm run dev`, confirm the header phone, footer legal line, about page copy and home contact block look identical to production. Kill the server.

- [ ] **Step 7: Commit**

```bash
git add "src/app/(site)" src/components/site-header.tsx src/components/mobile-menu.tsx src/components/site-footer.tsx
git commit -m "feat: render company info and about content from D1"
```

---

### Task 4: Admin — Company and About editors (+ nav links)

**Files:**
- Create: `src/app/admin/(protected)/company/page.tsx`, `src/app/admin/(protected)/company/company-form.tsx`, `src/app/admin/(protected)/company/actions.ts`
- Create: `src/app/admin/(protected)/about/page.tsx`, `src/app/admin/(protected)/about/about-form.tsx`, `src/app/admin/(protected)/about/actions.ts`
- Modify: `src/app/admin/(protected)/layout.tsx` (add Company + About to the Content group in `NAV_GROUPS`)

**Interfaces:**
- Consumes: `getCompanyInfo()`/`getAboutContent()` and types from Task 2; `upsert` is per-file local; R2 binding `env.PROJECT_IMAGES`; `.field/.input/.btn` classes.
- Produces: routes `/admin/company` and `/admin/about`. A shared local pattern both actions files repeat (deliberately — two files, no premature shared helper): `upsertSetting(env, key, value, now)` doing `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`.

- [ ] **Step 1: Company actions**

Create `src/app/admin/(protected)/company/actions.ts`:

```ts
"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export type CompanyFormState = { status: "idle" } | { status: "saved" } | { status: "error"; message: string };

function field(formData: FormData, key: string, maxLength: number): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

const FIELDS: { name: string; key: string; label: string; max: number }[] = [
	{ name: "phone", key: "company.phone", label: "phone number", max: 40 },
	{ name: "email", key: "company.email", label: "email", max: 320 },
	{ name: "yard_suburb", key: "company.yard_suburb", label: "yard suburb", max: 120 },
	{ name: "hours", key: "company.hours", label: "hours", max: 60 },
	{ name: "legal_name", key: "company.legal_name", label: "legal name", max: 200 },
	{ name: "abn", key: "company.abn", label: "ABN", max: 40 },
	{ name: "coverage", key: "company.coverage", label: "coverage line", max: 200 },
];

export async function saveCompanyAction(_prevState: CompanyFormState, formData: FormData): Promise<CompanyFormState> {
	const values = FIELDS.map((f) => ({ ...f, value: field(formData, f.name, f.max) }));
	const missing = values.find((f) => !f.value);
	if (missing) return { status: "error", message: `Add the ${missing.label}.` };

	try {
		const { env } = await getCloudflareContext({ async: true });
		const now = new Date().toISOString();
		// D1 batch keeps the seven upserts in one round trip.
		await env.DB.batch(
			values.map((f) =>
				env.DB.prepare(
					"INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
				).bind(f.key, f.value, now),
			),
		);
	} catch (error) {
		console.error("Company info save failed", error);
		return { status: "error", message: "Save failed — try again." };
	}

	return { status: "saved" };
}
```

- [ ] **Step 2: Company form + page**

Create `src/app/admin/(protected)/company/company-form.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import type { CompanyInfo } from "@/lib/content";
import { saveCompanyAction, type CompanyFormState } from "./actions";

const initialState: CompanyFormState = { status: "idle" };

const FIELDS: { name: string; label: string; value: (c: CompanyInfo) => string }[] = [
	{ name: "phone", label: "Phone", value: (c) => c.phone },
	{ name: "email", label: "Email", value: (c) => c.email },
	{ name: "yard_suburb", label: "Yard suburb", value: (c) => c.yardSuburb },
	{ name: "hours", label: "Hours", value: (c) => c.hours },
	{ name: "legal_name", label: "Legal name", value: (c) => c.legalName },
	{ name: "abn", label: "ABN", value: (c) => c.abn },
	{ name: "coverage", label: "Coverage line", value: (c) => c.coverage },
];

export default function CompanyForm({ initial }: { initial: CompanyInfo }) {
	const [state, formAction, isPending] = useActionState(saveCompanyAction, initialState);

	return (
		<form action={formAction} style={{ display: "grid", gap: 16, maxWidth: 640 }}>
			{state.status === "error" && (
				<div
					role="alert"
					style={{
						padding: "12px 14px",
						border: "1px solid var(--color-divider)",
						borderLeft: "3px solid var(--color-accent-700)",
						background: "var(--color-surface)",
						fontSize: 13,
						lineHeight: "20px",
					}}
				>
					{state.message}
				</div>
			)}
			{state.status === "saved" && (
				<div role="status" style={{ padding: "12px 14px", border: "1px solid var(--color-divider)", background: "var(--color-surface)", fontSize: 13, lineHeight: "20px" }}>
					Saved — the site shows the new details immediately.
				</div>
			)}
			{FIELDS.map((f) => (
				<div className="field" key={f.name}>
					<label htmlFor={`c-${f.name}`}>{f.label}</label>
					<input className="input" id={`c-${f.name}`} name={f.name} type="text" required defaultValue={f.value(initial)} />
				</div>
			))}
			<div>
				<button type="submit" className="btn btn-primary" style={{ minHeight: 40, paddingInline: 22 }} disabled={isPending}>
					{isPending ? "Saving…" : "Save company info"}
				</button>
			</div>
		</form>
	);
}
```

Create `src/app/admin/(protected)/company/page.tsx`:

```tsx
import { getCompanyInfo } from "@/lib/content";
import { kicker, kickerRule, pageGutter } from "@/lib/style-tokens";
import CompanyForm from "./company-form";

export const dynamic = "force-dynamic";

export default async function AdminCompanyPage() {
	const company = await getCompanyInfo();

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter}` }}>
			<span style={kicker}>Company info</span>
			<hr style={kickerRule} />
			<p style={{ fontSize: 14, lineHeight: "22px", maxWidth: "60ch", margin: "0 0 24px", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
				These details appear in the site header, footer, contact block and quote form. Changes go live as soon as you save.
			</p>
			<CompanyForm initial={company} />
		</div>
	);
}
```

(Match the heading markup of the existing admin pages — check `src/app/admin/(protected)/faqs/page.tsx` and mirror its header block style if it differs from the above.)

- [ ] **Step 3: About actions (text upserts + two photo slots)**

Create `src/app/admin/(protected)/about/actions.ts`:

```ts
"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";

export type AboutFormState = { status: "idle" } | { status: "saved" } | { status: "error"; message: string };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// Allowlist, not startsWith("image/") — image/svg+xml can carry scripts and
// /media serves from the app origin. Mirrors projects/actions.ts.
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

function field(formData: FormData, key: string, maxLength: number): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

const TEXT_FIELDS: { name: string; key: string; label: string; max: number }[] = [
	{ name: "headline", key: "about.headline", label: "headline", max: 200 },
	{ name: "intro", key: "about.intro", label: "intro paragraph", max: 1000 },
	{ name: "who_heading", key: "about.who_heading", label: "first section heading", max: 100 },
	{ name: "who_body", key: "about.who_body", label: "first section paragraph", max: 2000 },
	{ name: "compliant_heading", key: "about.compliant_heading", label: "second section heading", max: 100 },
	{ name: "compliant_body", key: "about.compliant_body", label: "second section paragraph", max: 2000 },
	{ name: "yard_body", key: "about.yard_body", label: "yard paragraph", max: 2000 },
	{ name: "crew_image_alt", key: "about.crew_image_alt", label: "crew photo description", max: 300 },
	{ name: "yard_image_alt", key: "about.yard_image_alt", label: "yard photo description", max: 300 },
];

interface PhotoSlot {
	fileField: string;
	settingKey: string;
	r2Prefix: string;
}

const PHOTO_SLOTS: PhotoSlot[] = [
	{ fileField: "crew_photo", settingKey: "about.crew_image", r2Prefix: "about/crew" },
	{ fileField: "yard_photo", settingKey: "about.yard_image", r2Prefix: "about/yard" },
];

export async function saveAboutAction(_prevState: AboutFormState, formData: FormData): Promise<AboutFormState> {
	const values = TEXT_FIELDS.map((f) => ({ ...f, value: field(formData, f.name, f.max) }));
	const missing = values.find((f) => !f.value);
	if (missing) return { status: "error", message: `Add the ${missing.label}.` };

	// Validate both uploads before writing anything.
	const uploads: { slot: PhotoSlot; file: File }[] = [];
	for (const slot of PHOTO_SLOTS) {
		const file = formData.get(slot.fileField);
		if (file instanceof File && file.size > 0) {
			if (!ALLOWED_IMAGE_TYPES.has(file.type)) return { status: "error", message: "Use a JPEG, PNG, WEBP, AVIF or GIF photo." };
			if (file.size > MAX_IMAGE_BYTES) return { status: "error", message: "Photos must be under 5MB." };
			uploads.push({ slot, file });
		}
	}

	const { env } = await getCloudflareContext({ async: true });
	const now = new Date().toISOString();

	// Fresh timestamped keys (never reused) so /media can cache immutably;
	// old objects are removed only after the settings write commits.
	const newKeys: { slot: PhotoSlot; key: string }[] = [];
	try {
		for (const { slot, file } of uploads) {
			const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "jpg";
			const key = `${slot.r2Prefix}-${Date.now()}.${ext}`;
			await env.PROJECT_IMAGES.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
			newKeys.push({ slot, key });
		}

		const oldKeys = new Map<string, string>();
		for (const { slot } of newKeys) {
			const existing = await env.DB.prepare("SELECT value FROM site_settings WHERE key = ?").bind(slot.settingKey).first<{ value: string }>();
			if (existing?.value) oldKeys.set(slot.settingKey, existing.value);
		}

		const statements = values.map((f) =>
			env.DB.prepare(
				"INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
			).bind(f.key, f.value, now),
		);
		for (const { slot, key } of newKeys) {
			statements.push(
				env.DB.prepare(
					"INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
				).bind(slot.settingKey, key, now),
			);
		}
		await env.DB.batch(statements);

		for (const oldKey of oldKeys.values()) {
			await env.PROJECT_IMAGES.delete(oldKey).catch(() => {});
		}
	} catch (error) {
		// A failed write must not leave fresh uploads orphaned in R2.
		for (const { key } of newKeys) {
			await env.PROJECT_IMAGES.delete(key).catch(() => {});
		}
		console.error("About save failed", error);
		return { status: "error", message: "Save failed — try again." };
	}

	return { status: "saved" };
}
```

- [ ] **Step 4: About form + page**

Create `src/app/admin/(protected)/about/about-form.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import type { AboutContent } from "@/lib/content";
import { saveAboutAction, type AboutFormState } from "./actions";

const initialState: AboutFormState = { status: "idle" };

function PhotoSlot({ label, fileField, altField, currentKey, currentAlt }: { label: string; fileField: string; altField: string; currentKey: string | null; currentAlt: string }) {
	return (
		<fieldset style={{ border: "1px solid var(--color-divider)", padding: 16, display: "grid", gap: 12 }}>
			<legend style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 6px" }}>{label}</legend>
			{currentKey ? (
				// eslint-disable-next-line @next/next/no-img-element -- R2 photos are served unoptimised by design (see /media route)
				<img src={`/media/${currentKey}`} alt={currentAlt} style={{ display: "block", maxWidth: 320, width: "100%", height: "auto" }} />
			) : (
				<p style={{ margin: 0, fontSize: 13, color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>No photo yet — the site shows a placeholder frame.</p>
			)}
			<div className="field">
				<label htmlFor={`a-${fileField}`}>{currentKey ? "Replace photo" : "Upload photo"} (JPEG/PNG/WEBP/AVIF/GIF, under 5MB)</label>
				<input className="input" id={`a-${fileField}`} name={fileField} type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/gif" />
			</div>
			<div className="field">
				<label htmlFor={`a-${altField}`}>Photo description (for screen readers)</label>
				<input className="input" id={`a-${altField}`} name={altField} type="text" required defaultValue={currentAlt} />
			</div>
		</fieldset>
	);
}

export default function AboutForm({ initial }: { initial: AboutContent }) {
	const [state, formAction, isPending] = useActionState(saveAboutAction, initialState);

	return (
		<form action={formAction} style={{ display: "grid", gap: 16, maxWidth: 720 }}>
			{state.status === "error" && (
				<div role="alert" style={{ padding: "12px 14px", border: "1px solid var(--color-divider)", borderLeft: "3px solid var(--color-accent-700)", background: "var(--color-surface)", fontSize: 13, lineHeight: "20px" }}>
					{state.message}
				</div>
			)}
			{state.status === "saved" && (
				<div role="status" style={{ padding: "12px 14px", border: "1px solid var(--color-divider)", background: "var(--color-surface)", fontSize: 13, lineHeight: "20px" }}>
					Saved — the about page shows the new content immediately.
				</div>
			)}
			<div className="field">
				<label htmlFor="a-headline">Headline</label>
				<input className="input" id="a-headline" name="headline" type="text" required defaultValue={initial.headline} />
			</div>
			<div className="field">
				<label htmlFor="a-intro">Intro paragraph</label>
				<textarea className="input" id="a-intro" name="intro" required rows={3} defaultValue={initial.intro} />
			</div>
			<div className="field">
				<label htmlFor="a-who-heading">First section heading</label>
				<input className="input" id="a-who-heading" name="who_heading" type="text" required defaultValue={initial.whoHeading} />
			</div>
			<div className="field">
				<label htmlFor="a-who-body">First section paragraph</label>
				<textarea className="input" id="a-who-body" name="who_body" required rows={4} defaultValue={initial.whoBody} />
			</div>
			<div className="field">
				<label htmlFor="a-compliant-heading">Second section heading</label>
				<input className="input" id="a-compliant-heading" name="compliant_heading" type="text" required defaultValue={initial.compliantHeading} />
			</div>
			<div className="field">
				<label htmlFor="a-compliant-body">Second section paragraph</label>
				<textarea className="input" id="a-compliant-body" name="compliant_body" required rows={4} defaultValue={initial.compliantBody} />
			</div>
			<div className="field">
				<label htmlFor="a-yard-body">Yard paragraph</label>
				<textarea className="input" id="a-yard-body" name="yard_body" required rows={3} defaultValue={initial.yardBody} />
			</div>
			<PhotoSlot label="Crew photo" fileField="crew_photo" altField="crew_image_alt" currentKey={initial.crewImageKey} currentAlt={initial.crewImageAlt} />
			<PhotoSlot label="Yard photo" fileField="yard_photo" altField="yard_image_alt" currentKey={initial.yardImageKey} currentAlt={initial.yardImageAlt} />
			<div>
				<button type="submit" className="btn btn-primary" style={{ minHeight: 40, paddingInline: 22 }} disabled={isPending}>
					{isPending ? "Saving…" : "Save about page"}
				</button>
			</div>
		</form>
	);
}
```

Create `src/app/admin/(protected)/about/page.tsx`:

```tsx
import { getAboutContent } from "@/lib/content";
import { kicker, kickerRule, pageGutter } from "@/lib/style-tokens";
import AboutForm from "./about-form";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
	const about = await getAboutContent();

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter}` }}>
			<span style={kicker}>About page</span>
			<hr style={kickerRule} />
			<p style={{ fontSize: 14, lineHeight: "22px", maxWidth: "60ch", margin: "0 0 24px", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
				This is the /about page&rsquo;s content. Photos replace the placeholder frames as soon as they&rsquo;re uploaded.
			</p>
			<AboutForm initial={about} />
		</div>
	);
}
```

- [ ] **Step 5: Nav links**

In `src/app/admin/(protected)/layout.tsx`, extend the Content group:

```ts
{
	label: "Content",
	items: [
		{ href: "/admin/projects", label: "Projects" },
		{ href: "/admin/faqs", label: "FAQs" },
		{ href: "/admin/company", label: "Company info" },
		{ href: "/admin/about", label: "About page" },
	],
},
```

- [ ] **Step 6: Verify**

```bash
NODE_OPTIONS= npx tsc --noEmit && NODE_OPTIONS= npm run lint
```

Then `NODE_OPTIONS= npm run dev`, log in (Developer login, `.dev.vars` password), and check: `/admin/company` shows the seeded values, saving an edited phone updates the public header on refresh; `/admin/about` shows seeded copy, editing the headline updates `/about`; uploading a small test photo to the crew slot renders it on `/about` (and re-uploading replaces it). Kill the server. Report exactly which checks were done.

- [ ] **Step 7: Commit**

```bash
git add "src/app/admin/(protected)/company" "src/app/admin/(protected)/about" "src/app/admin/(protected)/layout.tsx"
git commit -m "feat: admin editors for company info and the about page"
```

---

### Task 5: Admin — Stats and Testimonials CRUD (+ nav links)

**Files:**
- Create: `src/app/admin/(protected)/stats/page.tsx`, `stats/stat-form.tsx`, `stats/actions.ts`, `stats/new/page.tsx`, `stats/[id]/edit/page.tsx`
- Create: `src/app/admin/(protected)/testimonials/page.tsx`, `testimonials/testimonial-form.tsx`, `testimonials/actions.ts`, `testimonials/new/page.tsx`, `testimonials/[id]/edit/page.tsx`
- Modify: `src/app/admin/(protected)/layout.tsx` (add Stats + Testimonials to Content)

**Interfaces:**
- Consumes: tables from Task 1. Mirrors the FAQ section's file structure exactly (`src/app/admin/(protected)/faqs/*`) — read those five files first and copy their page/list/table markup, changing only fields. Integer autoincrement ids arrive as strings from route params.
- Produces: routes `/admin/stats`, `/admin/stats/new`, `/admin/stats/[id]/edit`, `/admin/testimonials`, `/admin/testimonials/new`, `/admin/testimonials/[id]/edit`.

- [ ] **Step 1: Stats actions**

Create `src/app/admin/(protected)/stats/actions.ts`:

```ts
"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

export type StatFormState = { status: "idle" } | { status: "error"; message: string };

function field(formData: FormData, key: string, maxLength: number): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function saveStatAction(_prevState: StatFormState, formData: FormData): Promise<StatFormState> {
	const id = field(formData, "id", 20);
	const value = field(formData, "value", 40);
	const label = field(formData, "label", 100);
	const detail = field(formData, "detail", 200);
	const accent = formData.get("accent") === "on" ? 1 : 0;
	const sortOrder = Number.parseInt(field(formData, "sort_order", 10), 10);

	if (!value) return { status: "error", message: "Add the big value (e.g. AS 4687)." };
	if (!label) return { status: "error", message: "Add the label." };
	if (!detail) return { status: "error", message: "Add the detail line." };
	if (Number.isNaN(sortOrder)) return { status: "error", message: "Sort order must be a number." };

	const { env } = await getCloudflareContext({ async: true });
	const now = new Date().toISOString();

	try {
		if (id) {
			const result = await env.DB.prepare(
				"UPDATE stats SET value = ?, label = ?, detail = ?, accent = ?, sort_order = ?, updated_at = ? WHERE id = ?",
			)
				.bind(value, label, detail, accent, sortOrder, now, id)
				.run();
			if (result.meta.changes === 0) return { status: "error", message: "That stat no longer exists." };
		} else {
			await env.DB.prepare(
				"INSERT INTO stats (value, label, detail, accent, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
			)
				.bind(value, label, detail, accent, sortOrder, now, now)
				.run();
		}
	} catch (error) {
		console.error("Stat save failed", error);
		return { status: "error", message: "Save failed — try again." };
	}

	redirect("/admin/stats");
}

export async function deleteStatAction(formData: FormData): Promise<void> {
	const id = field(formData, "id", 20);
	if (!id) return;

	const { env } = await getCloudflareContext({ async: true });
	await env.DB.prepare("DELETE FROM stats WHERE id = ?").bind(id).run();

	redirect("/admin/stats");
}
```

- [ ] **Step 2: Stats form and pages**

`stats/stat-form.tsx` — mirror `faqs/faq-form.tsx` (same error-box markup, same layout), with:
`export interface StatFormValues { id: string; value: string; label: string; detail: string; accent: boolean; sortOrder: number }`,
props `{ initial?: StatFormValues }`, hidden `id` input (`value={initial?.id ?? ""}`), text inputs `value`/`label`, textarea `detail` (rows 2), a checkbox field:

```tsx
<label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
	<input type="checkbox" name="accent" defaultChecked={initial?.accent} />
	Accent colour (highlights the value)
</label>
```

number input `sort_order`, submit label "Save stat".

`stats/page.tsx` — mirror `faqs/page.tsx`: `dynamic = "force-dynamic"`, query `SELECT id, value, label, detail, accent, sort_order FROM stats ORDER BY sort_order, id`, table columns Value / Label / Detail / Accent (render `row.accent === 1 ? "Yes" : "—"`) / Sort, per-row Edit link to `/admin/stats/${row.id}/edit` and a Delete form posting `deleteStatAction` with hidden `id`, plus a "New stat" button linking `/admin/stats/new`, kicker "Stats". Copy the exact table/classes markup from the FAQ list page.

`stats/new/page.tsx` — mirror `faqs/new/page.tsx`: renders `<StatForm />` under a "New stat" heading.

`stats/[id]/edit/page.tsx` — mirror `faqs/[id]/edit/page.tsx`: `dynamic = "force-dynamic"`, fetch `SELECT id, value, label, detail, accent, sort_order FROM stats WHERE id = ?`; `notFound()` when missing; map to `StatFormValues` (`accent: row.accent === 1`, `id: String(row.id)`); render `<StatForm initial={...} />`.

- [ ] **Step 3: Testimonials actions, form and pages**

Same four-file shape as stats, in `src/app/admin/(protected)/testimonials/`:

`actions.ts`: `TestimonialFormState`, `saveTestimonialAction` with fields `quote` (textarea, max 600, message "Add the quote."), `source` (max 200, message "Add the source line (e.g. — Site manager, Sydney)."), `sort_order`; UPDATE/INSERT against `testimonials (quote, source, sort_order, ...)`; `deleteTestimonialAction`; redirects to `/admin/testimonials`.

`testimonial-form.tsx`: `TestimonialFormValues { id: string; quote: string; source: string; sortOrder: number }`; textarea `quote` (rows 4), input `source`, number `sort_order`, submit "Save testimonial".

`page.tsx`: list with columns Quote (truncate long quotes with `style={{ maxWidth: 420 }}` on the cell) / Source / Sort + Edit/Delete + "New testimonial"; kicker "Testimonials".

`new/page.tsx` and `[id]/edit/page.tsx`: mirror the stats equivalents against the `testimonials` table.

- [ ] **Step 4: Nav links**

In `layout.tsx`'s Content group, append after About page:

```ts
{ href: "/admin/stats", label: "Stats" },
{ href: "/admin/testimonials", label: "Testimonials" },
```

- [ ] **Step 5: Verify**

```bash
NODE_OPTIONS= npx tsc --noEmit && NODE_OPTIONS= npm run lint
```

Dev-server check: create, edit and delete a test stat and a test testimonial; confirm the about page's stats section reflects the change and restore the original values (delete the test rows). Kill the server; report checks done.

- [ ] **Step 6: Commit**

```bash
git add "src/app/admin/(protected)/stats" "src/app/admin/(protected)/testimonials" "src/app/admin/(protected)/layout.tsx"
git commit -m "feat: admin CRUD for stats and testimonials"
```

---

### Task 6: Admin — Clients and Compliance tags inline editors (+ nav links)

**Files:**
- Create: `src/app/admin/(protected)/clients/page.tsx`, `clients/actions.ts`
- Create: `src/app/admin/(protected)/compliance-tags/page.tsx`, `compliance-tags/actions.ts`
- Modify: `src/app/admin/(protected)/layout.tsx` (add Clients + Compliance tags to Content)

**Interfaces:**
- Consumes: `clients` and `compliance_tags` tables from Task 1.
- Produces: routes `/admin/clients` and `/admin/compliance-tags` — single-page editors: an add-row form on top, then one form per row (name/label + accent + sort inputs, Save and Delete buttons). Plain server-action `<form>`s, no client components — rows are one or two fields and the page re-renders on redirect.

- [ ] **Step 1: Clients actions**

Create `src/app/admin/(protected)/clients/actions.ts`:

```ts
"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

function field(formData: FormData, key: string, maxLength: number): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

// Single-page editor: empty submissions just redirect back — with one text
// field per row there's nothing useful to report, and required inputs stop
// it client-side anyway.
export async function addClientAction(formData: FormData): Promise<void> {
	const name = field(formData, "name", 200);
	const sortOrder = Number.parseInt(field(formData, "sort_order", 10), 10) || 0;

	if (name) {
		const { env } = await getCloudflareContext({ async: true });
		const now = new Date().toISOString();
		await env.DB.prepare("INSERT INTO clients (name, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?)")
			.bind(name, sortOrder, now, now)
			.run();
	}

	redirect("/admin/clients");
}

export async function updateClientAction(formData: FormData): Promise<void> {
	const id = field(formData, "id", 20);
	const name = field(formData, "name", 200);
	const sortOrder = Number.parseInt(field(formData, "sort_order", 10), 10) || 0;

	if (id && name) {
		const { env } = await getCloudflareContext({ async: true });
		await env.DB.prepare("UPDATE clients SET name = ?, sort_order = ?, updated_at = ? WHERE id = ?")
			.bind(name, sortOrder, new Date().toISOString(), id)
			.run();
	}

	redirect("/admin/clients");
}

export async function deleteClientAction(formData: FormData): Promise<void> {
	const id = field(formData, "id", 20);
	if (id) {
		const { env } = await getCloudflareContext({ async: true });
		await env.DB.prepare("DELETE FROM clients WHERE id = ?").bind(id).run();
	}

	redirect("/admin/clients");
}
```

- [ ] **Step 2: Clients page**

Create `src/app/admin/(protected)/clients/page.tsx`:

```tsx
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { kicker, kickerRule, pageGutter } from "@/lib/style-tokens";
import { addClientAction, deleteClientAction, updateClientAction } from "./actions";

export const dynamic = "force-dynamic";

interface ClientRow {
	id: number;
	name: string;
	sort_order: number;
}

export default async function AdminClientsPage() {
	const { env } = await getCloudflareContext({ async: true });
	const { results } = await env.DB.prepare("SELECT id, name, sort_order FROM clients ORDER BY sort_order, id").all<ClientRow>();

	const rowStyle: React.CSSProperties = { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "10px 0", borderBottom: "1px solid var(--color-divider)" };

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter}` }}>
			<span style={kicker}>Client names</span>
			<hr style={kickerRule} />
			<p style={{ fontSize: 14, lineHeight: "22px", maxWidth: "60ch", margin: "0 0 24px", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
				The &ldquo;Who we work with&rdquo; tags on the about page. Lower sort numbers come first.
			</p>
			<form action={addClientAction} style={{ ...rowStyle, borderBottom: "2px solid var(--color-text)", paddingBottom: 16 }}>
				<input className="input" name="name" type="text" required placeholder="New client name" style={{ maxWidth: 320 }} />
				<input className="input" name="sort_order" type="number" defaultValue={results.length} style={{ maxWidth: 90 }} aria-label="Sort order" />
				<button type="submit" className="btn btn-primary" style={{ minHeight: 36, paddingInline: 18 }}>
					Add
				</button>
			</form>
			{results.map((row) => (
				<div key={row.id} style={rowStyle}>
					<form action={updateClientAction} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
						<input type="hidden" name="id" value={row.id} />
						<input className="input" name="name" type="text" required defaultValue={row.name} style={{ maxWidth: 320 }} />
						<input className="input" name="sort_order" type="number" defaultValue={row.sort_order} style={{ maxWidth: 90 }} aria-label="Sort order" />
						<button type="submit" className="btn btn-secondary" style={{ minHeight: 36, paddingInline: 16 }}>
							Save
						</button>
					</form>
					<form action={deleteClientAction}>
						<input type="hidden" name="id" value={row.id} />
						<button type="submit" className="btn btn-secondary" style={{ minHeight: 36, paddingInline: 16 }}>
							Delete
						</button>
					</form>
				</div>
			))}
		</div>
	);
}
```

- [ ] **Step 3: Compliance tags actions + page**

Same two-file shape in `src/app/admin/(protected)/compliance-tags/`, against `compliance_tags`:

`actions.ts`: `addComplianceTagAction` / `updateComplianceTagAction` / `deleteComplianceTagAction`, identical to the clients actions with `label` (max 100) instead of `name` plus `const accent = formData.get("accent") === "on" ? 1 : 0;` bound into the INSERT/UPDATE (`INSERT INTO compliance_tags (label, accent, sort_order, created_at, updated_at)` / `UPDATE compliance_tags SET label = ?, accent = ?, sort_order = ?, updated_at = ? WHERE id = ?`). Redirects to `/admin/compliance-tags`.

`page.tsx`: same layout as the clients page with kicker "Compliance tags", intro "Shown on the about and compliance pages. The accent tag renders in the highlight colour."; each row's forms additionally carry:

```tsx
<label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
	<input type="checkbox" name="accent" defaultChecked={row.accent === 1} />
	Accent
</label>
```

(and the add form the same checkbox unchecked; the row query selects `id, label, accent, sort_order`).

- [ ] **Step 4: Nav links**

Append to the Content group after Testimonials:

```ts
{ href: "/admin/clients", label: "Clients" },
{ href: "/admin/compliance-tags", label: "Compliance tags" },
```

- [ ] **Step 5: Verify**

```bash
NODE_OPTIONS= npx tsc --noEmit && NODE_OPTIONS= npm run lint
```

Dev-server check: add/rename/delete a test client and tag; toggle a tag's accent; confirm the about page tag rows update; restore original data. Kill the server; report checks done.

- [ ] **Step 6: Commit**

```bash
git add "src/app/admin/(protected)/clients" "src/app/admin/(protected)/compliance-tags" "src/app/admin/(protected)/layout.tsx"
git commit -m "feat: admin inline editors for clients and compliance tags"
```

---

### Task 7: Playwright coverage, full verification, PR

**Files:**
- Create: `tests/site-content.spec.ts`

**Interfaces:**
- Consumes: everything above; local D1 seeded by Task 1 (Playwright's webServer is `next dev`, which uses the local D1).

- [ ] **Step 1: Write the content e2e spec**

Create `tests/site-content.spec.ts` (match the single-quote style of `tests/nav.spec.ts`):

```ts
import { test, expect } from '@playwright/test';

test.describe('D1-backed site content', () => {
	test('about page renders the seeded content', async ({ page }) => {
		await page.goto('/about');
		await expect(page.getByRole('heading', { name: 'One crew. One engineer. Every hoarding.' })).toBeVisible();
		await expect(page.getByText('AS 4687 certified').first()).toBeVisible();
		await expect(page.getByText('Harbourline Constructions')).toBeVisible();
	});

	test('header and footer render the seeded company info', async ({ page }) => {
		await page.goto('/about');
		await expect(page.getByRole('link', { name: '1300 722 477' }).first()).toBeVisible();
		await expect(page.getByText('Pacific Hoarding Pty Ltd · ABN 96 686 186 934')).toBeVisible();
	});
});
```

Note: the footer only renders on pages that include `<SiteFooter />` — check where it appears (home page quote-desk section); if `/about` has no footer, point the second test at `/` and scroll the quote section into view, or assert the footer text on `/` directly. Adjust the selector to what actually renders — do not weaken the assertion to `toHaveCount(0)` tricks.

- [ ] **Step 2: Full verification**

```bash
NODE_OPTIONS= npm run test:unit
NODE_OPTIONS= npx tsc --noEmit
NODE_OPTIONS= npm run lint
NODE_OPTIONS= npm test
```

All green, including the pre-existing specs (seeds equal old hardcoded values, so nothing should shift).

- [ ] **Step 3: Commit, push, PR**

```bash
git add tests/site-content.spec.ts
git commit -m "test: cover D1-backed about page and company info rendering"
git push -u origin feat/editable-content
```

Open the PR: title `feat: editable company info, about page and content lists`, base `main`. Fill `.github/pull_request_template.md` completely. The body must include a **Deploy steps** section:

1. After merge, apply the migration to production D1 (one-time): `npx wrangler d1 migrations apply pacifichoardings-db --remote` — until it runs, the public site serves the compiled-in fallbacks (identical to today's content), so nothing breaks.
2. No new secrets or bindings.

End the body with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Do NOT merge. Report the PR URL.
