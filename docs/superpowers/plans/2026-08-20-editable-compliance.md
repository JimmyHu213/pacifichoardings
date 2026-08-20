# Editable Compliance Page Implementation Plan (CMS PR 4 — final)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Every editable piece of `/compliance` (headline, five body paragraphs, two 4-card grids, two photo slots) moves into `site_settings` under `compliance.*`, edited from one `/admin/compliance` form; the tag row switches to the shared `compliance_tags` list.

**Architecture:** Migration 0010 INSERTs the `compliance.*` keys into the existing `site_settings` table (text seeds + two JSON card arrays; image keys unseeded, alts seeded). A `getComplianceContent()` getter with compiled-in fallbacks feeds the public page; the admin editor mirrors `/admin/about` (upserts, two R2 photo slots under `compliance/`, `requireAdminSession()`). The FAQ section already reads D1 and is untouched.

**Tech Stack:** Next.js 16 App Router, Cloudflare D1 + R2 (existing bucket), existing admin patterns. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-08-19-admin-cms-expansion-design.md` Part 4.

## Global Constraints

- Seed strings must equal the CURRENT RENDERED page text exactly — the JSX uses `&rsquo;` entities, so seeds carry the real curly apostrophe `’` (U+2019); em-dashes `—` as-is. The plan supplies the strings verbatim; Task 3 machine-verifies by diffing the local page's visible text against the PRODUCTION page (`https://pacifichoardings.com.au/compliance`), which still renders the hardcoded copy.
- Layout stays uneditable: kickers/headings ("Compliance", "Engineered to standard", "Council permits & traffic control", "SafeWork NSW", "Insurance", "What you get", "Questions we get on this") and the `<Metadata>` remain hardcoded. Editable: exactly the spec Part 4 key table.
- The tag row renders the SHARED `getComplianceTags()` list (already D1-backed since PR 1) — the four hardcoded `<span class="tag">`s are deleted.
- Photo rules verbatim from existing code (allowlist Set, 5MB, fresh keys `compliance/<slot>-<Date.now()>.<ext>`, delete-old-after-commit, cleanup-on-failure). `requireAdminSession()` first in every action. Upserts via `INSERT ... ON CONFLICT(key) DO UPDATE` (copy the exact SQL from `about/actions.ts`).
- Migration INSERTs use `INSERT OR IGNORE` so a partial remote apply can't duplicate or fail on retry.
- Branch `feat/editable-compliance` off `main`. Conventional Commits. Never touch `main`. Prefix every node/npm/npx command with `NODE_OPTIONS= `; quote paths with parens/brackets. D1 `pacifichoardings-db`, LOCAL only; remote apply post-merge.
- Verification per task: tsc + lint; final gate adds test:unit, build, Playwright (21 pre-existing specs stay green; kill stale port 3299).

---

### Task 1: Migration 0010 — compliance.* seeds

**Files:**
- Create: `migrations/0010_seed_compliance_settings.sql`

**Interfaces:**
- Produces (used by Tasks 2 and 4): `site_settings` rows `compliance.headline`, `compliance.intro`, `compliance.standards_body`, `compliance.standards_cards` (JSON `[{label,detail}]` ×4), `compliance.permits_body`, `compliance.safework_body`, `compliance.insurance_body`, `compliance.handover_body`, `compliance.handover_cards` (JSON ×4), `compliance.permit_image_alt`, `compliance.crew_image_alt`. Image KEYS (`compliance.permit_image`, `compliance.crew_image`) are NOT seeded.

- [ ] **Step 1: Write the migration**

Create `migrations/0010_seed_compliance_settings.sql` with EXACTLY this content (curly apostrophes `’` are deliberate — the page's `&rsquo;` entities render as them; SQL strings contain no straight apostrophes so no `''` doubling is needed):

```sql
-- Editable compliance-page content joins site_settings. Seeds equal the
-- page's current hardcoded copy (JSX &rsquo; entities carried as ’), so the
-- cutover is invisible. Image KEYS are not seeded — absent keys render the
-- placeholder frames. INSERT OR IGNORE keeps a partial remote apply safe.
INSERT OR IGNORE INTO site_settings (key, value, updated_at) VALUES
	('compliance.headline', 'Compliant is the minimum', '2026-08-20T00:00:00.000Z'),
	('compliance.intro', 'Every hoarding we put up is designed, certified and permitted before the first panel goes up. This is what that actually means — the standard we build to, the approvals council asks for, and what lands in your inbox when the job’s done.', '2026-08-20T00:00:00.000Z'),
	('compliance.standards_body', 'Class A fencing and hoardings are built to AS 4687, the Australian Standard for temporary fencing and hoardings. Class B overhead decks are a different animal — they’re engineered to AS/NZS 1170 load cases under the SafeWork NSW Overhead Protective Structures Code of Practice. Either way, the engineering is done from the first drawing, not retrofitted with paperwork once the structure’s already standing.', '2026-08-20T00:00:00.000Z'),
	('compliance.standards_cards', '[{"label":"Drawings","detail":"General arrangement drawings for the specific site and hoarding type"},{"label":"Load cases","detail":"Wind, live and dead loads calculated for the site’s actual conditions"},{"label":"Tie-downs","detail":"Footing and tie-down details engineered to the ground conditions on site"},{"label":"Sign-off","detail":"Signed and stamped by our structural engineer before the permit is lodged"}]', '2026-08-20T00:00:00.000Z'),
	('compliance.permits_body', 'Any hoarding standing on or over public land — a footpath, road reserve or laneway — needs council consent under section 138 of the Roads Act 1993 before it goes up. Three approvals usually travel together: the hoarding permit itself, footpath occupation where the hoarding or gantry extends over council land, and a traffic control plan wherever pedestrians or vehicles need to be managed around it. We prepare and lodge all three, and stay the point of contact if council comes back with questions.', '2026-08-20T00:00:00.000Z'),
	('compliance.safework_body', 'Every install runs under a Safe Work Method Statement to SafeWork NSW’s requirements, and every installer on our crew holds the licence the job calls for — high-risk construction work licensing included. That’s not a certificate kept in a drawer; it’s what the crew is actually working to on site.', '2026-08-20T00:00:00.000Z'),
	('compliance.insurance_body', 'We carry $20M public liability cover on every job, and can supply a certificate of currency before you need one — for your principal contractor agreement, your PC’s file, or your own insurer.', '2026-08-20T00:00:00.000Z'),
	('compliance.handover_body', 'Every job hands back the same paper trail — nothing you have to chase after the crew’s left site.', '2026-08-20T00:00:00.000Z'),
	('compliance.handover_cards', '[{"label":"Engineering drawings","detail":"Signed general arrangement and load case drawings"},{"label":"Permit approvals","detail":"Copies of the hoarding, footpath and traffic control approvals"},{"label":"Insurance certificate","detail":"Certificate of currency for our $20M public liability cover"},{"label":"Compliance sign-off","detail":"Written confirmation the install matches the certified drawings"}]', '2026-08-20T00:00:00.000Z'),
	('compliance.permit_image_alt', 'Approved hoarding permit signage on site', '2026-08-20T00:00:00.000Z'),
	('compliance.crew_image_alt', 'Pacific Hoardings crew on site in full PPE', '2026-08-20T00:00:00.000Z');
```

IMPORTANT accuracy check before continuing: the seeds must match `src/app/(site)/compliance/page.tsx`'s copy — including the `asSpecs`/`handoverSpecs` arrays near the top of that file. Note the `standards_cards` "Load cases" detail: the page's source array says `"Wind, live and dead loads calculated for the site's actual conditions"` — READ THE ACTUAL FILE and carry whatever apostrophe form it uses in that TS string (a TS string literal renders literally — if the file has a straight `'` there, the seed must use a straight apostrophe, SQL-doubled as `''`). Verify every card string against the file, not this plan.

- [ ] **Step 2: Apply and verify**

```bash
sqlite3 :memory: "CREATE TABLE site_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);" ".read migrations/0010_seed_compliance_settings.sql" "SELECT COUNT(*) FROM site_settings;"
```
Expected: 11, no errors. Then `NODE_OPTIONS= npx wrangler d1 migrations apply pacifichoardings-db --local` and `NODE_OPTIONS= npx wrangler d1 execute pacifichoardings-db --local --command "SELECT COUNT(*) FROM site_settings WHERE key LIKE 'compliance.%';"` → 11. Also verify both JSON card values parse: query them and `JSON.parse` in a scratch node -e.

- [ ] **Step 3: Commit**

```bash
git add migrations/0010_seed_compliance_settings.sql
git commit -m "feat: seed compliance page content into site_settings"
```

---

### Task 2: Content layer — getComplianceContent

**Files:**
- Modify: `src/lib/content/types.ts`, `src/lib/content/fallbacks.ts`, `src/lib/content/index.ts`

**Interfaces:**
- Produces (used by Tasks 3–4):

```ts
export interface ComplianceCard {
	label: string;
	detail: string;
}
export interface ComplianceContent {
	headline: string;
	intro: string;
	standardsBody: string;
	standardsCards: ComplianceCard[];
	permitsBody: string;
	safeworkBody: string;
	insuranceBody: string;
	handoverBody: string;
	handoverCards: ComplianceCard[];
	permitImageKey: string | null;
	permitImageAlt: string;
	crewImageKey: string | null;
	crewImageAlt: string;
}
export async function getComplianceContent(): Promise<ComplianceContent>;
```

- [ ] **Step 1: Types** — append the two interfaces above to `types.ts`; add `ComplianceContent`, `ComplianceCard` to `index.ts`'s type re-export line.

- [ ] **Step 2: Fallbacks** — append `complianceContentFallback: ComplianceContent` to `fallbacks.ts` with values equal to migration 0010's seeds character-for-character (cards as parsed objects; image keys `null`; the same curly-apostrophe rule — and the same "read the page file for the cards' apostropnes" caution as Task 1). Include the sync-with-seeds comment style used by the other fallbacks.

- [ ] **Step 3: Getter** — in `index.ts` add (using the existing `getSiteSettings` helper):

```ts
export async function getComplianceContent(): Promise<ComplianceContent> {
	try {
		const s = await getSiteSettings("compliance");
		const parseCards = (value: string | undefined, fallback: ComplianceCard[]): ComplianceCard[] => {
			if (!value) return fallback;
			try {
				return JSON.parse(value) as ComplianceCard[];
			} catch {
				return fallback;
			}
		};
		if (s.size === 0) return complianceContentFallback;
		return {
			headline: s.get("compliance.headline") ?? complianceContentFallback.headline,
			intro: s.get("compliance.intro") ?? complianceContentFallback.intro,
			standardsBody: s.get("compliance.standards_body") ?? complianceContentFallback.standardsBody,
			standardsCards: parseCards(s.get("compliance.standards_cards"), complianceContentFallback.standardsCards),
			permitsBody: s.get("compliance.permits_body") ?? complianceContentFallback.permitsBody,
			safeworkBody: s.get("compliance.safework_body") ?? complianceContentFallback.safeworkBody,
			insuranceBody: s.get("compliance.insurance_body") ?? complianceContentFallback.insuranceBody,
			handoverBody: s.get("compliance.handover_body") ?? complianceContentFallback.handoverBody,
			handoverCards: parseCards(s.get("compliance.handover_cards"), complianceContentFallback.handoverCards),
			permitImageKey: s.get("compliance.permit_image") ?? null,
			permitImageAlt: s.get("compliance.permit_image_alt") ?? complianceContentFallback.permitImageAlt,
			crewImageKey: s.get("compliance.crew_image") ?? null,
			crewImageAlt: s.get("compliance.crew_image_alt") ?? complianceContentFallback.crewImageAlt,
		};
	} catch (error) {
		console.error("Failed to load compliance content from D1", error);
		return complianceContentFallback;
	}
}
```

- [ ] **Step 4: Verify + commit** — `NODE_OPTIONS= npx tsc --noEmit` and lint clean (nothing consumes it yet, so fully clean).

```bash
git add src/lib/content
git commit -m "feat: compliance content getter with fallbacks"
```

---

### Task 3: Public page renders from D1

**Files:**
- Modify: `src/app/(site)/compliance/page.tsx`

**Interfaces:**
- Consumes: `getComplianceContent()`, `getComplianceTags()` (exists since PR 1), `getFaqs()` (already used).

- [ ] **Step 1: Rework the page** — delete the module-level `asSpecs`/`handoverSpecs` arrays; fetch `const [faqs, content, tags] = await Promise.all([getFaqs(), getComplianceContent(), getComplianceTags()]);`. Replace: the `<h1>` text → `{content.headline}`; hero paragraph → `{content.intro}`; standards paragraph → `{content.standardsBody}`; the first card grid maps `content.standardsCards`; permits paragraph → `{content.permitsBody}`; SafeWork paragraph → `{content.safeworkBody}`; insurance paragraph → `{content.insuranceBody}`; "What you get" intro → `{content.handoverBody}`; the second card grid maps `content.handoverCards` (exact field names per Task 2's interface: `standardsCards`, `handoverCards`).
  The two `<figure>` ImageSlots become photo-or-placeholder (same conditional as the about page — read `src/app/(site)/about/page.tsx` for the exact pattern), using `content.permitImageKey`/`permitImageAlt` for the permits figure and `content.crewImageKey`/`crewImageAlt` for the SafeWork figure, with the current placeholder strings kept as the ImageSlot placeholder text. The hardcoded four tag `<span>`s are replaced by the same `tags.map(...)` block the about page uses. Kickers/headings/metadata untouched.

- [ ] **Step 2: Machine-verify against production** — with the dev server running, extract and diff visible text:

```bash
NODE_OPTIONS= node -e "
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&rsquo;/g, '’').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
Promise.all([
  fetch('https://pacifichoardings.com.au/compliance').then((r) => r.text()),
  fetch('http://localhost:3000/compliance').then((r) => r.text()),
]).then(([prod, local]) => {
  const probes = ['job’s done', 'structure’s already standing', 'site’s actual conditions', 'NSW’s requirements', 'PC’s file', 'crew’s left site', 'Wind, live and dead loads', 'Certificate of currency'];
  const p = strip(prod); const l = strip(local);
  for (const probe of probes) {
    const inProd = p.includes(probe); const inLocal = l.includes(probe);
    console.log((inProd === inLocal && inLocal ? 'OK  ' : 'FAIL') + ' ' + probe + ' prod=' + inProd + ' local=' + inLocal);
  }
});"
```

Every line must print OK (adjust the probe for the cards apostrophe form if the file differs — the point is prod and local must AGREE). Include the output in your report. Any FAIL means a seed/fallback transcription error — fix the seed AND fallback, re-apply via direct UPDATE locally, and re-run.

- [ ] **Step 3: Full check + commit** — tsc, lint, `NODE_OPTIONS= npm test` (21 specs green — smoke may assert compliance text; investigate any failure).

```bash
git add "src/app/(site)/compliance/page.tsx"
git commit -m "feat: compliance page renders from D1 content"
```

---

### Task 4: Admin — /admin/compliance editor (+ nav link)

**Files:**
- Create: `src/app/admin/(protected)/compliance/page.tsx`, `compliance/compliance-form.tsx`, `compliance/actions.ts`
- Modify: `src/app/admin/(protected)/layout.tsx` (Content group gains `{ href: "/admin/compliance", label: "Compliance page" }` after Services)

**Interfaces:**
- Consumes: Task 2 getter/types; `about/actions.ts` + `about-form.tsx` as the pattern source (READ BOTH FIRST — this is the same shape: text upserts + two photo slots).
- Produces: `saveComplianceAction(prev: ComplianceFormState, formData): Promise<ComplianceFormState>` (`{status:"idle"|"saved"} | {status:"error";message}`). Field names: `headline`, `intro`, `standards_body`, `permits_body`, `safework_body`, `insurance_body`, `handover_body`, `standards_label_0..3` + `standards_detail_0..3`, `handover_label_0..3` + `handover_detail_0..3`, `permit_photo`/`crew_photo` (files), `permit_image_alt`/`crew_image_alt`.

- [ ] **Step 1: actions.ts** — mirror `about/actions.ts` exactly (requireAdminSession first; TEXT_FIELDS table mapping name→`compliance.*` key with sensible maxLengths: headline 200, intro 1000, bodies 2000; validate all text, then assemble the two card arrays from the 8+8 indexed fields (every label max 100 / detail max 300 required — error `Fill in standards card N` / `Fill in handover card N`), then validate both photo slots, then the upsert batch: the 7 text keys + `compliance.standards_cards`/`compliance.handover_cards` as `JSON.stringify(cards)` + alt keys + any uploaded photo keys (`compliance/permit-<ts>.<ext>` / `compliance/crew-<ts>.<ext>`), with the same old-key-read → batch → delete-old ordering and failure cleanup as the about action. Pre-flight is not needed (site_settings always exists — upserts work pre-migration too; missing seeds simply mean the keys get created, which is fine).

- [ ] **Step 2: compliance-form.tsx** — mirror `about-form.tsx`: error/saved boxes; text input `headline`; textareas `intro` (3), `standards_body` (4), `permits_body` (4), `safework_body` (3), `insurance_body` (3), `handover_body` (2); a "Standards cards" fieldset with 4 pairs (`standards_label_N` input + `standards_detail_N` textarea rows 2); a "Handover cards" fieldset with 4 pairs; two PhotoSlot fieldsets ("Permits photo" → `permit_photo`/`permit_image_alt`, "Crew photo" → `crew_photo`/`crew_image_alt`) with current-photo preview via `/media/<key>`; submit "Save compliance page". Props `{ initial: ComplianceContent }`.

- [ ] **Step 3: page.tsx** — mirror `about/page.tsx`: `dynamic = "force-dynamic"`, kicker "Compliance page", intro line "This is the /compliance page's content. The tag row is edited under Compliance tags.", render the form with `getComplianceContent()`.

- [ ] **Step 4: nav** — add the link; verify tsc + lint clean; curl 307 check on `/admin/compliance`. Interactive checks are the controller's job.

- [ ] **Step 5: Commit**

```bash
git add "src/app/admin/(protected)/compliance" "src/app/admin/(protected)/layout.tsx"
git commit -m "feat: admin editor for the compliance page"
```

---

### Task 5: E2E, full gate, PR

**Files:**
- Create: `tests/compliance.spec.ts`

- [ ] **Step 1: Spec** (2-space, single quotes):

```ts
import { test, expect } from '@playwright/test';

test.describe('D1-backed compliance page', () => {
  test('renders the seeded content and shared tags', async ({ page }) => {
    await page.goto('/compliance');
    await expect(page.getByRole('heading', { name: 'Compliant is the minimum' })).toBeVisible();
    await expect(page.getByText('section 138 of the Roads Act 1993')).toBeVisible();
    await expect(page.getByText('$20M public liability').first()).toBeVisible();
  });
});
```

- [ ] **Step 2: Full gate** — `NODE_OPTIONS= npm run test:unit`, `npx tsc --noEmit`, `npm run lint`, `npm run build`, `npm test` (22 specs green).

- [ ] **Step 3: Commit, push, PR**

```bash
git add tests/compliance.spec.ts
git commit -m "test: cover the D1-backed compliance page"
git push -u origin feat/editable-compliance
```

PR: title `feat: editable compliance page`, base `main`, full template. Body: this completes the 5-PR CMS roadmap; deploy step — post-merge `npx wrangler d1 migrations apply pacifichoardings-db --remote` (window: public page serves identical fallbacks; the admin compliance editor WORKS pre-migration since it upserts into the existing site_settings table — saves just create the keys early, which is harmless); tag row now shared with the about page; controller browser verification note; Claude Code attribution. Do NOT merge. Report the PR URL.
