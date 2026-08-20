# Add/Remove Services Implementation Plan (CMS PR 5)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The client can add and remove services from the admin, not just edit the fixed four — with slugs locked after creation and deletion warning about attached projects but proceeding.

**Architecture:** Services become ordinary client-managed content. A `sort_order` column lets added services be positioned; the "fixed four" assumptions (static-array slug allowlists in two actions files, the empty-table resurrect branch in `getServices`) are unwound so D1 is the sole source of truth for *which* services exist. The static array survives only as an outage fallback. New create/delete server actions join the existing edit action, and the services list page gains New/Delete controls.

**Tech Stack:** Next.js 16 App Router, Cloudflare D1 + R2 (existing bucket), existing admin patterns. No new dependencies.

**Design decisions (Jimmy, 2026-08-20):** slugs locked after creation (renaming = delete + recreate); deleting a service with attached projects warns with the count but proceeds; Council permits already retired separately in PR #31.

## Global Constraints

- **Prerequisite: PR #31 (`fix/remove-council-permits`) must be merged into `main` first** — it touches `static/services.ts` and the same three specs this plan edits. Verify before branching: `git log main --oneline -8 | grep -q "council permits" || echo "MERGE #31 FIRST"`. Branch `feat/services-crud` off updated `main`.
- **Slug rules:** lowercase letters/numbers/hyphens (`/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, the existing `SLUG_PATTERN` in `projects/actions.ts`), max 100 chars, unique (D1 PRIMARY KEY enforces it — catch the UNIQUE error and return a friendly message). Settable ONLY on create; the edit form renders it read-only and `saveServiceAction` ignores any submitted change.
- **D1 is the source of truth for which services exist.** `static/services.ts` remains ONLY as the compiled-in outage fallback and must be commented as such. An empty `services` table means "no services" — never resurrect the static array from an empty result.
- Every new/changed server action calls `await requireAdminSession();` first.
- Photo rules verbatim from the existing code: allowlist Set (never `startsWith`), 5MB cap, fresh timestamped keys `services/<slug>/<slot>-<Date.now()>.<ext>`, old object deleted only after D1 commits, cleanup on failed write. **Deleting a service deletes both of its R2 objects** (only non-empty keys).
- `faq_ids` stays non-editable: new services are created with `[]`.
- Conventional Commits. Never touch `main`. Prefix every node/npm/npx command with `NODE_OPTIONS= `; quote paths with parens/brackets. D1 `pacifichoardings-db`, LOCAL only (`--local`); remote apply is a post-merge step.
- Tabs in `src/`, 2-space in `tests/`. Existing error-message tone (see `faqs/actions.ts`).
- Verification per task: `NODE_OPTIONS= npx tsc --noEmit` + `NODE_OPTIONS= npm run lint`; final task adds `npm run test:unit`, `npm run build`, `npm test` (Playwright; kill stale port 3299 first).

---

### Task 1: `sort_order` migration

**Files:**
- Create: `migrations/0012_add_service_sort_order.sql`

**Rationale (do not skip):** without this, every added service lands last in the header dropdown, home list and related-services blocks, and the client cannot move it — which defeats the point of letting them add one. Every other client-managed list in this CMS (stats, clients, compliance_tags, testimonials) already has `sort_order`; this brings services in line.

**Interfaces:**
- Produces (used by Tasks 2–5): `services.sort_order INTEGER NOT NULL DEFAULT 0`, backfilled so the existing display order is preserved exactly.

- [ ] **Step 1: Write the migration**

Create `migrations/0012_add_service_sort_order.sql`:

```sql
-- Services become fully client-managed (add/remove), so they need the same
-- explicit ordering every other editable list has — otherwise a newly added
-- service is stuck last in the nav with no way to move it. Backfilled from
-- rowid so today's order is preserved exactly.
ALTER TABLE services ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

UPDATE services SET sort_order = (
	SELECT COUNT(*) FROM services AS earlier WHERE earlier.rowid < services.rowid
);
```

- [ ] **Step 2: Apply locally and verify the order is unchanged**

```bash
NODE_OPTIONS= npx wrangler d1 migrations apply pacifichoardings-db --local
NODE_OPTIONS= npx wrangler d1 execute pacifichoardings-db --local --command "SELECT slug, sort_order FROM services ORDER BY sort_order, rowid;"
```

Expected: the three services in their current order with `sort_order` 0, 1, 2 — `class-a-hoarding`, `class-b-hoarding`, `design-certification`. (If Council permits is still present, PR #31 was not merged — stop and escalate.)

- [ ] **Step 3: Commit**

```bash
git add migrations/0012_add_service_sort_order.sql
git commit -m "feat: add sort_order to services"
```

---

### Task 2: Content layer — ordering and no resurrection

**Files:**
- Modify: `src/lib/content/types.ts` (`Service` gains `sortOrder: number`)
- Modify: `src/lib/content/index.ts` (`getServices` selects/orders by `sort_order`; DELETE the empty-table resurrect branch)
- Modify: `src/lib/content/static/services.ts` (add `sortOrder` to each entry; update the file's header comment)

**Interfaces:**
- Produces (used by Tasks 3–5): `Service.sortOrder: number`; `getServices()` returns rows ordered by `sort_order, rowid`, returns `[]` for an empty table, and returns the static array ONLY on a thrown D1 error.

- [ ] **Step 1: Type**

In `src/lib/content/types.ts`, add to the `Service` interface (after `slug`):

```ts
	/** Display order across the nav, home list and related-services blocks. */
	sortOrder: number;
```

- [ ] **Step 2: Static fallback**

In `src/lib/content/static/services.ts`, add `sortOrder: 0`, `1`, `2` to the three entries respectively (immediately after each `slug` line), and replace the file's top comment with:

```ts
// Compiled-in fallback ONLY. D1 is the source of truth for which services
// exist — the client adds and removes them from /admin/services. This array
// is a frozen snapshot used when D1 is unreachable, so during an outage a
// recently added service is missing and a recently removed one reappears.
// Keep it roughly current, but never treat it as authoritative.
```

(If the file has no top comment, add this above the import.)

- [ ] **Step 3: Getter**

In `src/lib/content/index.ts`, in `getServices`:

1. Add `sort_order: number;` to the `ServiceRow` interface.
2. Change the SELECT to include `sort_order` and order by it:
   `"SELECT slug, sort_order, title, body, tagline, overview, when_you_need_it, specs, process, compliance_tags, faq_ids, images FROM services ORDER BY sort_order, rowid"`
3. **DELETE the line `if (results.length === 0) return services;`** — with services client-managed, an empty table means the client removed them all, and resurrecting the static three would be wrong (and unremovable). Replace it with nothing; the `.map` below handles an empty array correctly.
4. Add `sortOrder: row.sort_order,` to the mapped object.
5. Leave the `catch` returning the static array (outage safety) untouched.

- [ ] **Step 4: Verify + commit**

```bash
NODE_OPTIONS= npx tsc --noEmit && NODE_OPTIONS= npm run lint
```
Both clean (the static entries now satisfy the extended type).

```bash
git add src/lib/content
git commit -m "feat: order services by sort_order and stop resurrecting removed ones"
```

---

### Task 3: Unwind the fixed-four assumptions

**Files:**
- Modify: `src/app/admin/(protected)/services/actions.ts` (slug validation from D1, not the static array)
- Modify: `src/app/admin/(protected)/projects/actions.ts` (same — otherwise a newly added service cannot be attached to any project)
- Modify: `src/app/admin/(protected)/projects/page.tsx` (title map from `getServices()`, fixing the known stale-title backlog item)

**Interfaces:**
- Consumes: Task 2's `getServices()`.
- Produces: both actions validate submitted slugs against the live services table; no admin file imports `static/services` any more (only `src/lib/content/index.ts` does, for the outage fallback).

- [ ] **Step 1: services/actions.ts**

Replace the static import and the `SERVICE_SLUGS` const:

```ts
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireAdminSession } from "@/lib/admin-auth";
```

(drop the `staticServices` import and the `const SERVICE_SLUGS = ...` line and its "The four services are fixed" comment).

In `saveServiceAction`, replace the `if (!SERVICE_SLUGS.has(slug))` guard with a format check, and let the existing pre-flight `SELECT images FROM services WHERE slug = ?` be the existence check (it already returns a friendly error when the row is missing):

```ts
	const slug = field(formData, "slug", 100);
	// Slugs are locked after creation — this action only ever updates an
	// existing row, and the pre-flight read below rejects unknown slugs.
	if (!SLUG_PATTERN.test(slug)) return { status: "error", message: "Unknown service." };
```

and add near the other constants:

```ts
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
```

Also change the pre-flight's not-found message from the migration wording to `"That service no longer exists."` — with delete now possible, a missing row usually means it was removed in another tab, not that the migration is unapplied. (Keep the surrounding try/catch, whose catch message about applying the migration stays as-is for the genuine table-missing case.)

- [ ] **Step 2: projects/actions.ts**

Replace `import { services } from "@/lib/content/static/services";` with `import { getServices } from "@/lib/content";`, delete the `const SERVICE_SLUGS = new Set(services.map((s) => s.slug));` line, and inside `saveProjectAction` replace the validation line with a live lookup placed immediately before it:

```ts
	const serviceSlugs = new Set((await getServices()).map((s) => s.slug));
	if (!serviceSlugs.has(serviceSlug)) return { status: "error", message: "Pick the service this project belongs to." };
```

(`getServices()` handles its own context fetch and falls back on error, so this is safe where the old constant was used.)

- [ ] **Step 3: projects/page.tsx**

Replace `import { services } from "@/lib/content/static/services";` with `import { getServices } from "@/lib/content";` and build the title map from the live list — find the existing `serviceTitleBySlug` construction and change its source to `(await getServices())`. The page is already an async server component. Leave the rest of the page (including the raw-slug fallback for unknown slugs, which is what makes a deleted service degrade gracefully) untouched.

- [ ] **Step 4: Verify + commit**

```bash
grep -rn "static/services" "src/app/admin" && echo "STILL IMPORTING STATIC — fix it" || echo "clean"
NODE_OPTIONS= npx tsc --noEmit && NODE_OPTIONS= npm run lint
```

```bash
git add "src/app/admin/(protected)/services/actions.ts" "src/app/admin/(protected)/projects"
git commit -m "feat: validate service slugs against D1 instead of the static array"
```

---

### Task 4: Create a service

**Files:**
- Modify: `src/app/admin/(protected)/services/actions.ts` (add `createServiceAction`)
- Modify: `src/app/admin/(protected)/services/service-form.tsx` (create mode)
- Create: `src/app/admin/(protected)/services/new/page.tsx`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: `createServiceAction(prev: ServiceFormState, formData): Promise<ServiceFormState>` reading the same field names as `saveServiceAction` plus `slug` and `sort_order`; `ServiceForm` accepts `{ initial?: ServiceFormValues }` — absent `initial` means create mode; `ServiceFormValues` gains `sortOrder: number`.

- [ ] **Step 1: createServiceAction**

Append to `src/app/admin/(protected)/services/actions.ts`:

```ts
export async function createServiceAction(_prevState: ServiceFormState, formData: FormData): Promise<ServiceFormState> {
	await requireAdminSession();

	const slug = field(formData, "slug", 100);
	if (!SLUG_PATTERN.test(slug)) {
		return { status: "error", message: "Slug must be lowercase letters, numbers and hyphens." };
	}

	const title = field(formData, "title", 100);
	const tagline = field(formData, "tagline", 200);
	const body = field(formData, "body", 500);
	const overview = field(formData, "overview", 2000);
	const whenYouNeedIt = field(formData, "when_you_need_it", 2000);
	if (!title) return { status: "error", message: "Add the title." };
	if (!tagline) return { status: "error", message: "Add the tagline." };
	if (!body) return { status: "error", message: "Add the card copy." };
	if (!overview) return { status: "error", message: "Add the overview." };
	if (!whenYouNeedIt) return { status: "error", message: "Add the 'when you need it' paragraph." };

	const specs: { label: string; detail: string }[] = [];
	const process: { step: string; detail: string }[] = [];
	for (let i = 0; i < 4; i++) {
		const specLabel = field(formData, `spec_label_${i}`, 100);
		const specDetail = field(formData, `spec_detail_${i}`, 300);
		const processStep = field(formData, `process_step_${i}`, 100);
		const processDetail = field(formData, `process_detail_${i}`, 300);
		if (!specLabel || !specDetail) return { status: "error", message: `Fill in spec card ${i + 1} (label and detail).` };
		if (!processStep || !processDetail) return { status: "error", message: `Fill in process step ${i + 1} (name and detail).` };
		specs.push({ label: specLabel, detail: specDetail });
		process.push({ step: processStep, detail: processDetail });
	}

	const complianceTags = field(formData, "compliance_tags", 600)
		.split("\n")
		.map((t) => t.trim())
		.filter(Boolean)
		.slice(0, 6);
	if (complianceTags.length === 0) return { status: "error", message: "Add at least one compliance tag." };

	const alts = [field(formData, "image_alt_0", 300), field(formData, "image_alt_1", 300)];
	if (!alts[0] || !alts[1]) return { status: "error", message: "Add both photo descriptions." };

	const sortOrder = Number.parseInt(field(formData, "sort_order", 10), 10);
	if (Number.isNaN(sortOrder)) return { status: "error", message: "Sort order must be a number." };

	// Photos are attached after creation from the edit page — a new service
	// starts with empty slots so there is nothing to upload or roll back here.
	const images = alts.map((alt) => ({ key: "", alt }));

	try {
		const { env } = await getCloudflareContext({ async: true });
		const now = new Date().toISOString();
		await env.DB.prepare(
			`INSERT INTO services (slug, sort_order, title, body, tagline, overview, when_you_need_it, specs, process, compliance_tags, faq_ids, images, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		)
			.bind(
				slug,
				sortOrder,
				title,
				body,
				tagline,
				overview,
				whenYouNeedIt,
				JSON.stringify(specs),
				JSON.stringify(process),
				JSON.stringify(complianceTags),
				"[]",
				JSON.stringify(images),
				now,
			)
			.run();
	} catch (error) {
		if (error instanceof Error && error.message.includes("UNIQUE")) {
			return { status: "error", message: "That slug is already in use." };
		}
		console.error("Service create failed", error);
		return { status: "error", message: "Save failed — try again." };
	}

	redirect(`/admin/services/${slug}/edit`);
}
```

Add `import { redirect } from "next/navigation";` to the file's imports if absent. (Landing on the edit page mirrors the projects create flow and is where photos get attached.)

- [ ] **Step 2: service-form.tsx create mode**

Change the component signature to `export default function ServiceForm({ initial }: { initial?: ServiceFormValues })`, add `sortOrder: number;` to `ServiceFormValues`, and:

```tsx
	const isEdit = Boolean(initial);
	const [state, formAction, isPending] = useActionState(isEdit ? saveServiceAction : createServiceAction, initialState);
```

(import `createServiceAction` alongside `saveServiceAction`.)

Replace the hidden slug input with a visible field that is read-only when editing — mirroring `faqs/faq-form.tsx`'s id field:

```tsx
<div className="field">
	<label htmlFor="s-slug">Slug {isEdit && "(fixed — it's the page URL)"}</label>
	<input
		className="input"
		id="s-slug"
		name="slug"
		type="text"
		required
		pattern="[a-z0-9]+(-[a-z0-9]+)*"
		title="Lowercase letters, numbers and hyphens"
		defaultValue={initial?.slug}
		readOnly={isEdit}
		style={isEdit ? { opacity: 0.6 } : undefined}
	/>
</div>
```

Add a sort-order field next to it:

```tsx
<div className="field" style={{ maxWidth: 160 }}>
	<label htmlFor="s-sort">Sort order</label>
	<input className="input" id="s-sort" name="sort_order" type="number" required defaultValue={initial?.sortOrder ?? 0} />
</div>
```

Every other field keeps its markup but must tolerate `initial` being undefined — change each `defaultValue={initial.x}` to `defaultValue={initial?.x}`, each `initial.specs[i].label` to `initial?.specs[i]?.label`, the tags textarea to `defaultValue={initial?.complianceTags.join("\n")}`, and the two PhotoSlot props to `currentKey={initial?.images[i]?.key ?? null}` / `currentAlt={initial?.images[i]?.alt ?? ""}`. Submit label: `{isEdit ? "Save service" : "Create service"}` (and the pending label `{isPending ? "Saving…" : ...}` as today).

- [ ] **Step 3: new/page.tsx**

Create `src/app/admin/(protected)/services/new/page.tsx`, mirroring `projects/new/page.tsx`'s shell:

```tsx
import type { Metadata } from "next";
import { pageGutter } from "@/lib/style-tokens";
import ServiceForm from "../service-form";

export const metadata: Metadata = { title: "New service — Pacific Hoardings Admin" };

export default function NewServicePage() {
	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 8px" }}>
				New service
			</h1>
			<p style={{ fontSize: 14, lineHeight: "22px", maxWidth: "60ch", margin: "0 0 24px", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
				The slug becomes the page address (/services/your-slug) and can&rsquo;t be changed afterwards. Photos are added on the next screen once the service exists.
			</p>
			<ServiceForm />
		</div>
	);
}
```

- [ ] **Step 4: edit page passes sortOrder**

In `src/app/admin/(protected)/services/[slug]/edit/page.tsx`, add `sortOrder: service.sortOrder,` to the `ServiceFormValues` object it builds.

- [ ] **Step 5: Verify + commit**

```bash
NODE_OPTIONS= npx tsc --noEmit && NODE_OPTIONS= npm run lint
```

```bash
git add "src/app/admin/(protected)/services"
git commit -m "feat: create new services from the admin"
```

---

### Task 5: Delete a service, and rework the list page

**Files:**
- Modify: `src/app/admin/(protected)/services/actions.ts` (add `deleteServiceAction`)
- Modify: `src/app/admin/(protected)/services/page.tsx` (New button, per-row Delete, attached-project counts, updated copy)

**Interfaces:**
- Consumes: Tasks 1–4.
- Produces: `deleteServiceAction(formData): Promise<void>` reading field `slug`; the list page shows each service's attached-project count.

- [ ] **Step 1: deleteServiceAction**

Append to `src/app/admin/(protected)/services/actions.ts`:

```ts
export async function deleteServiceAction(formData: FormData): Promise<void> {
	await requireAdminSession();

	const slug = field(formData, "slug", 100);
	if (!SLUG_PATTERN.test(slug)) return;

	const { env } = await getCloudflareContext({ async: true });
	// Read the photo keys before the row goes — the R2 objects are only
	// removed once D1 has committed, so a failed delete can't strand a live
	// service pointing at missing images.
	const existing = await env.DB.prepare("SELECT images FROM services WHERE slug = ?").bind(slug).first<{ images: string }>();
	await env.DB.prepare("DELETE FROM services WHERE slug = ?").bind(slug).run();

	if (existing) {
		let keys: string[] = [];
		try {
			keys = (JSON.parse(existing.images) as { key: string }[]).filter((img) => img.key).map((img) => img.key);
		} catch {
			keys = [];
		}
		for (const key of keys) {
			await env.PROJECT_IMAGES.delete(key).catch(() => {});
		}
	}

	// Projects tagged with this slug are deliberately left alone: they keep
	// showing the raw slug until retagged, which is the agreed behaviour and
	// matches how an unknown slug already degrades today.
	redirect("/admin/services");
}
```

- [ ] **Step 2: List page**

Rework `src/app/admin/(protected)/services/page.tsx`:

1. Fetch the attached-project counts alongside the services:

```tsx
const { env } = await getCloudflareContext({ async: true });
const [services, { results: counts }] = await Promise.all([
	getServices(),
	env.DB.prepare("SELECT service_slug, COUNT(*) AS n FROM projects GROUP BY service_slug").all<{ service_slug: string; n: number }>(),
]);
const projectCountBySlug = new Map(counts.map((row) => [row.service_slug, row.n]));
```

(add the `getCloudflareContext` import, and import `deleteServiceAction` from `./actions` for the Delete forms below.)

2. Replace the intro paragraph with:

```tsx
Add, edit and remove the services shown across the site. A service&rsquo;s slug is its page address and can&rsquo;t be changed once created — to rename one, remove it and add it again. Lower sort numbers appear first.
```

3. Add a "New service" button in the header row, mirroring the projects list page's "New project" button, linking to `/admin/services/new`.

4. Add `Sort` and `Projects` columns, and a Delete form per row (sibling to the Edit link, never nested):

```tsx
<td>{service.sortOrder}</td>
<td>{projectCountBySlug.get(service.slug) ?? 0}</td>
<td style={{ whiteSpace: "nowrap", display: "flex", gap: 8 }}>
	<Link href={`/admin/services/${service.slug}/edit`} className="btn btn-secondary" style={{ fontSize: 13 }}>
		Edit
	</Link>
	<form action={deleteServiceAction}>
		<input type="hidden" name="slug" value={service.slug} />
		<button type="submit" className="btn btn-secondary" style={{ fontSize: 13 }}>
			Delete
		</button>
	</form>
</td>
```

5. Under the table, add the warning line that satisfies the agreed "warn but allow" behaviour:

```tsx
<p style={{ fontSize: 13, lineHeight: "20px", maxWidth: "70ch", marginTop: 16, color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
	Deleting a service removes its page and its photos, and drops it from the menu and the quote form. Any projects still tagged with it (see the Projects column) keep working — they just show the raw tag until you retag them.
</p>
```

Add `dynamic = "force-dynamic"` if not already present (it is).

- [ ] **Step 3: Verify + commit**

```bash
NODE_OPTIONS= npx tsc --noEmit && NODE_OPTIONS= npm run lint
```
Curl checks (auth-gated → 307): `/admin/services`, `/admin/services/new`.

```bash
git add "src/app/admin/(protected)/services"
git commit -m "feat: remove services from the admin with photo cleanup"
```

---

### Task 6: E2E, full gate, PR

**Files:**
- Modify: `tests/services.spec.ts`

- [ ] **Step 1: Add a spec covering the ordering contract**

The add/remove flows are auth-gated, so e2e covers what's publicly observable — that service order is data-driven, not hardcoded. Append inside the existing `test.describe` in `tests/services.spec.ts`:

```ts
  test('services render in sort order across nav and quote form', async ({ page }) => {
    await page.goto('/');
    const options = page.locator('#q-type option');
    await expect(options.nth(0)).toHaveText('Class A hoarding');
    await expect(options.nth(1)).toHaveText('Class B hoarding');
    await expect(options.nth(2)).toHaveText('Design & certification');
  });
```

- [ ] **Step 2: Full gate**

```bash
NODE_OPTIONS= npm run test:unit
NODE_OPTIONS= npx tsc --noEmit
NODE_OPTIONS= npm run lint
NODE_OPTIONS= npm run build
NODE_OPTIONS= npm test
```

All green. Debug real failures rather than adjusting assertions.

- [ ] **Step 3: Commit, push, PR**

```bash
git add tests/services.spec.ts
git commit -m "test: cover data-driven service ordering"
git push -u origin feat/services-crud
```

PR: title `feat: add and remove services from the admin`, base `main`, full template. The body must cover:

1. What the client can now do: add a service (slug set once, becomes the page URL), remove one (page, photos, menu entry and quote option all go), and reorder via sort numbers.
2. The agreed rules: slugs locked after creation; deleting warns about attached projects but proceeds, and those projects keep working while showing the raw tag.
3. **The behaviour change worth flagging:** `getServices()` no longer falls back to the built-in list when the table is empty — an empty services table now genuinely means no services. The built-in list remains only for a D1 outage, during which a recently added service is missing and a recently removed one briefly reappears.
4. Deploy step: after merge run `npx wrangler d1 migrations apply pacifichoardings-db --remote` (migration 0012 adds `sort_order`; until it runs, `getServices()` errors on the missing column and the site serves the built-in fallback list — visible content is unchanged, so there is no visitor impact, but apply it promptly).
5. The controller's live browser verification.
6. End with:

```
🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

Do NOT merge. Report the PR URL.
