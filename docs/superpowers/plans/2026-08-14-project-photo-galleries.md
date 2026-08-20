# Project Photo Galleries & Detail Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Projects support multiple photos (stored in a `project_images` D1 table, files in R2) managed from the admin, with new public `/projects/[slug]` detail pages showing the full gallery.

**Architecture:** A `project_images` table replaces the single `image_*` columns on `projects` (data migrated, columns dropped). The content layer returns `cover` + `images[]` per project and gains `getProject(slug)`. The admin project form handles metadata only; photos are managed by per-photo server-action forms on the edit page. Public cards link to a new dynamic detail route.

**Tech Stack:** Next.js 16 App Router on Cloudflare (OpenNext), D1 (SQLite), R2, React server actions, Playwright.

## Global Constraints

- **Never commit or push to `main`.** All work happens on branch `feat/project-galleries` (created fresh off `main` 2026-08-20). PR into `main` when done.
- Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, …).
- Tabs for indentation in `src/` (match existing files); 2-space in `tests/` (match existing specs).
- Image upload rules (copy exactly from existing code): allowlist `image/jpeg, image/png, image/webp, image/avif, image/gif`; max `5 * 1024 * 1024` bytes; never orphan an R2 object on a failed write; old objects deleted only after D1 commits.
- Playwright dev server runs `next dev -p 3299` against **local** D1 state — apply migrations locally with `npx wrangler d1 migrations apply pacifichoardings-db --local` before running tests.
- Spec: `docs/superpowers/specs/2026-08-14-admin-cms-design.md`.

**2026-08-20 execution amendments** (repo moved since this plan was written):

- The migration file is **`migrations/0008_create_project_images.sql`** — 0006 (OTP codes) and 0007 (site content) now exist. Every `0006_create_project_images` reference below reads as 0008.
- The D1 database name is **`pacifichoardings-db`** wherever a command says `DB`.
- **Every exported server action in the rewritten `projects/actions.ts` must call `await requireAdminSession();` as its first statement** (import from `@/lib/admin-auth` — added in CMS PR 1; server actions are standalone POST endpoints, the layout guard doesn't cover them). This applies to all five: `saveProjectAction`, `addProjectPhotoAction`, `updateProjectPhotoAction`, `deleteProjectPhotoAction`, `deleteProjectAction`.
- Local D1 currently has **6** project photos, not 7 — Task 1's verification expects one `project_images` row per project with a non-null `image_key` (verify the count matches `SELECT COUNT(*) FROM projects WHERE image_key IS NOT NULL` run BEFORE applying).
- Task 5's gate additionally runs `npm run test:unit` (vitest exists since CMS PR 1), and the push/PR use branch `feat/project-galleries`.
- Prefix every node/npm/npx command with `NODE_OPTIONS= ` (broken shell preload on this machine).
- The Playwright suite now has 14 pre-existing specs (admin-login, site-content added since) — all must stay green.

---

### Task 1: `project_images` migration

**Files:**
- Create: `migrations/0006_create_project_images.sql`

**Interfaces:**
- Produces: table `project_images(id, project_id, image_key, image_alt, width, height, sort_order, created_at)`; `projects` no longer has `image_key/image_alt/image_width/image_height`.

- [ ] **Step 1: Write the migration**

```sql
-- Projects move from one photo to a gallery. Existing single-photo columns
-- migrate into project_images (lowest sort_order = cover photo) and are then
-- dropped from projects. R2 objects are untouched — only the rows move.
CREATE TABLE IF NOT EXISTS project_images (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
	image_key TEXT NOT NULL,
	image_alt TEXT,
	width INTEGER,
	height INTEGER,
	sort_order INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_project_images_project ON project_images(project_id, sort_order);

INSERT INTO project_images (project_id, image_key, image_alt, width, height, sort_order, created_at)
SELECT id, image_key, image_alt, image_width, image_height, 0, updated_at
FROM projects
WHERE image_key IS NOT NULL;

ALTER TABLE projects DROP COLUMN image_key;
ALTER TABLE projects DROP COLUMN image_alt;
ALTER TABLE projects DROP COLUMN image_width;
ALTER TABLE projects DROP COLUMN image_height;
```

- [ ] **Step 2: Apply locally and verify**

Run: `npx wrangler d1 migrations apply DB --local`
Then: `npx wrangler d1 execute DB --local --command "SELECT project_id, image_key, sort_order FROM project_images ORDER BY project_id"`
Expected: 7 rows (the seven real photos), keys like `projects/commercial-tower-1785715200000.jpg`.
Then: `npx wrangler d1 execute DB --local --command "SELECT * FROM projects LIMIT 1"`
Expected: no `image_key` column in the result.

- [ ] **Step 3: Commit**

```bash
git add migrations/0006_create_project_images.sql
git commit -m "feat: move project photos into a project_images gallery table"
```

---

### Task 2: Content layer — galleries in `getProjects`, new `getProject(slug)`

**Files:**
- Modify: `src/lib/content/types.ts` (Project interface)
- Modify: `src/lib/content/index.ts` (getProjects; add getProject)
- Modify: `src/app/(site)/projects/page.tsx:57` (`project.image` → `project.cover`)
- Modify: `src/app/(site)/page.tsx` ProjectRail (uses `project.cover`)

**Interfaces:**
- Produces (used by Tasks 3 and 4):

```ts
export interface Project {
	id: string;
	slug: string;          // NEW — detail-page links
	title: string;
	detail: string;
	serviceSlug: string;
	timeframe: string;
	description: string;
	cover: ProjectImage;   // first photo, or placeholder shape when none
	images: ProjectImage[]; // real photos only (each key non-null), sorted
}
export async function getProject(slug: string): Promise<Project | null>;
```

`ProjectImage` keeps its existing shape (`placeholder`, `label`, `key`, `width`, `height`).

- [ ] **Step 1: Update the `Project` type**

In `src/lib/content/types.ts` replace the `Project` interface:

```ts
export interface Project {
	id: string;
	slug: string;
	title: string;
	detail: string;
	serviceSlug: string;
	timeframe: string;
	description: string;
	/** First gallery photo, or a placeholder-frame shape when the project has none. */
	cover: ProjectImage;
	/** All gallery photos in sort order — every entry has a non-null key. */
	images: ProjectImage[];
}
```

- [ ] **Step 2: Rewrite the projects getters in `src/lib/content/index.ts`**

Replace `ProjectRow` and `getProjects` with (two queries, grouped in JS — a JOIN would duplicate project fields per photo):

```ts
interface ProjectRow {
	id: number;
	slug: string;
	title: string;
	detail: string;
	service_slug: string;
	timeframe: string;
	description: string;
}

interface ProjectImageRow {
	project_id: number;
	image_key: string;
	image_alt: string | null;
	width: number | null;
	height: number | null;
}

function toProject(row: ProjectRow, imageRows: ProjectImageRow[]): Project {
	const images = imageRows.map((img) => ({
		placeholder: img.image_alt ?? `Drop a photo — ${row.title}`,
		label: img.image_alt ?? row.title,
		key: img.image_key,
		width: img.width,
		height: img.height,
	}));
	return {
		id: String(row.id),
		slug: row.slug,
		title: row.title,
		detail: row.detail,
		serviceSlug: row.service_slug,
		timeframe: row.timeframe,
		description: row.description,
		cover: images[0] ?? { placeholder: `Drop a photo — ${row.title}`, label: row.title, key: null, width: null, height: null },
		images,
	};
}

export async function getProjects(): Promise<Project[]> {
	try {
		const { env } = await getCloudflareContext({ async: true });
		const [{ results: rows }, { results: imageRows }] = await Promise.all([
			env.DB.prepare(
				"SELECT id, slug, title, detail, service_slug, timeframe, description FROM projects ORDER BY sort_order, id",
			).all<ProjectRow>(),
			env.DB.prepare(
				"SELECT project_id, image_key, image_alt, width, height FROM project_images ORDER BY sort_order, id",
			).all<ProjectImageRow>(),
		]);
		return rows.map((row) => toProject(row, imageRows.filter((img) => img.project_id === row.id)));
	} catch (error) {
		console.error("Failed to load projects from D1", error);
		return [];
	}
}

export async function getProject(slug: string): Promise<Project | null> {
	try {
		const { env } = await getCloudflareContext({ async: true });
		const row = await env.DB.prepare(
			"SELECT id, slug, title, detail, service_slug, timeframe, description FROM projects WHERE slug = ?",
		)
			.bind(slug)
			.first<ProjectRow>();
		if (!row) return null;
		const { results: imageRows } = await env.DB.prepare(
			"SELECT project_id, image_key, image_alt, width, height FROM project_images WHERE project_id = ? ORDER BY sort_order, id",
		)
			.bind(row.id)
			.all<ProjectImageRow>();
		return toProject(row, imageRows);
	} catch (error) {
		console.error("Failed to load project from D1", error);
		return null;
	}
}
```

- [ ] **Step 3: Update the two consumers of `project.image`**

`src/app/(site)/projects/page.tsx` line 57: `<ProjectImage image={project.image} />` → `<ProjectImage image={project.cover} />`.
`src/app/(site)/page.tsx` ProjectRail: find the `<ProjectImage … />` / `project.image` usage inside `ProjectRail` (around line 64–75) and replace `p.image` with `p.cover` (the rail keeps `variant="rail"`).

- [ ] **Step 4: The admin still references dropped columns — stub check**

`src/app/admin/(protected)/projects/actions.ts` and the edit page still SELECT the dropped columns; they are reworked in Task 4. To keep the build green mid-stream, Task 4 must land in the same PR — do **not** run the Playwright suite yet; just typecheck the content layer:

Run: `npx tsc --noEmit`
Expected: errors ONLY in `src/app/admin/(protected)/projects/*` (dropped-column selects are untyped strings, so likely zero errors; any error mentioning `image`/`cover` outside admin means Step 3 missed a consumer).

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/types.ts src/lib/content/index.ts "src/app/(site)/projects/page.tsx" "src/app/(site)/page.tsx"
git commit -m "feat: project content layer returns photo galleries"
```

---

### Task 3: Public `/projects/[slug]` detail page + card links

**Files:**
- Create: `src/app/(site)/projects/[slug]/page.tsx`
- Modify: `src/app/(site)/projects/page.tsx` (wrap card media + title in links)
- Create: `tests/projects.spec.ts`

**Interfaces:**
- Consumes: `getProject(slug)`, `getProjects()`, `getServices()` from `@/lib/content`; `ProjectImage` component (`image` + optional `variant` props); style tokens `pageGutter, kicker, kickerRule, sectionTitle, bodyCopy` from `@/lib/style-tokens`; `QuoteCta` component (`heading` prop); `Corners`, `ScrollReveal` components.

- [ ] **Step 1: Write the failing tests**

`tests/projects.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.describe('project detail pages', () => {
  test('a project card links to its detail page', async ({ page }) => {
    await page.goto('/projects');
    const firstCard = page.locator('.ph-proj').first();
    // Both the media figure and the title link to the detail page — take the first.
    await firstCard.getByRole('link', { name: /commercial tower/i }).first().click();
    await expect(page).toHaveURL(/\/projects\/commercial-tower$/);
    await expect(page.locator('h1')).toHaveText(/commercial tower/i);
  });

  test('detail page renders description and gallery photo', async ({ page }) => {
    await page.goto('/projects/commercial-tower');
    await expect(page.getByText(/140-linear-metre Class B gantry/i)).toBeVisible();
    await expect(page.locator('img[src*="/media/projects/"]').first()).toBeVisible();
  });

  test('unknown project slug returns 404', async ({ page }) => {
    const response = await page.goto('/projects/not-a-real-project');
    expect(response?.status()).toBe(404);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx playwright test tests/projects.spec.ts`
Expected: FAIL — no link named "commercial tower" on the card, `/projects/commercial-tower` 404s.

- [ ] **Step 3: Create the detail page**

`src/app/(site)/projects/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Corners from "@/components/corners";
import ProjectImage from "@/components/project-image";
import QuoteCta from "@/components/quote-cta";
import ScrollReveal from "@/components/scroll-reveal";
import { getProject, getServices } from "@/lib/content";
import { bodyCopy, kicker, kickerRule, pageGutter, sectionTitle } from "@/lib/style-tokens";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params;
	const project = await getProject(slug);
	if (!project) return { title: "Project — Pacific Hoardings" };
	return {
		title: `${project.title} — Pacific Hoardings`,
		description: project.description.slice(0, 160),
	};
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const [project, services] = await Promise.all([getProject(slug), getServices()]);
	if (!project) notFound();
	const serviceTitle = services.find((s) => s.slug === project.serviceSlug)?.title;

	return (
		<>
			<ScrollReveal />

			<div className="ph-sheet" style={{ maxWidth: 1240, margin: "0 auto", padding: `0 ${pageGutter}` }}>
				<section style={{ padding: "56px 0 32px" }}>
					<span style={kicker}>
						<Link href="/projects" style={{ color: "inherit", textDecoration: "none" }}>
							Projects
						</Link>
					</span>
					<hr style={kickerRule} />
					<h1 className="ph-reveal" style={{ ...sectionTitle, fontSize: "clamp(36px, 4.4vw, 60px)", margin: "0 0 12px" }}>
						{project.title}
					</h1>
					<p style={{ fontSize: 13, lineHeight: "20px", margin: "0 0 16px", color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>
						{project.detail} · {project.timeframe}
					</p>
					{serviceTitle && (
						<Link href={`/services/${project.serviceSlug}`} className="tag tag-accent" style={{ textDecoration: "none" }}>
							{serviceTitle}
						</Link>
					)}
					<p className="ph-reveal" style={{ ...bodyCopy, maxWidth: "64ch", margin: "20px 0 0" }}>
						{project.description}
					</p>
				</section>

				<section style={{ padding: "16px 0 72px", display: "grid", gap: 24 }}>
					{project.images.length === 0 && (
						<figure className="blueprint duotone" style={{ margin: 0 }}>
							<ProjectImage image={project.cover} />
							<Corners />
						</figure>
					)}
					{project.images.map((image) => (
						<figure key={image.key} className="blueprint duotone ph-reveal" style={{ margin: 0 }}>
							<ProjectImage image={image} />
							<Corners />
						</figure>
					))}
				</section>
			</div>

			<QuoteCta heading="Get your project priced" />
		</>
	);
}
```

- [ ] **Step 4: Link the cards through**

In `src/app/(site)/projects/page.tsx`, wrap the media figure and the title in links to the detail page (keep the existing service-tag link as is):

```tsx
<div className="ph-proj-media">
	<Link href={`/projects/${project.slug}`} aria-label={`${project.title} project details`}>
		<figure className="blueprint duotone" style={{ margin: 0 }}>
			<ProjectImage image={project.cover} />
			<Corners />
		</figure>
	</Link>
</div>
```

and

```tsx
<h2 style={{ fontSize: 22, lineHeight: "24px", letterSpacing: "0.02em", textTransform: "uppercase", margin: "12px 0 4px" }}>
	<Link href={`/projects/${project.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
		{project.title}
	</Link>
</h2>
```

(`Link` is already imported in this file.)

- [ ] **Step 5: Run the tests**

Run: `npx playwright test tests/projects.spec.ts`
Expected: PASS (3/3). If the 404 test fails with a 200, check `notFound()` is called before rendering.

- [ ] **Step 6: Commit**

```bash
git add "src/app/(site)/projects/[slug]/page.tsx" "src/app/(site)/projects/page.tsx" tests/projects.spec.ts
git commit -m "feat: public project detail pages with photo galleries"
```

---

### Task 4: Admin multi-photo management

**Files:**
- Modify: `src/app/admin/(protected)/projects/actions.ts` (metadata-only save; photo actions; delete removes all gallery objects)
- Modify: `src/app/admin/(protected)/projects/project-form.tsx` (drop photo fields)
- Modify: `src/app/admin/(protected)/projects/[id]/edit/page.tsx` (photos section)
- Modify: `src/app/admin/(protected)/projects/new/page.tsx` — no change to the file itself; the create action now redirects to the edit page (photos attach after create)

**Interfaces:**
- Consumes: `project_images` table (Task 1).
- Produces server actions used only within these admin pages:

```ts
saveProjectAction(prev: ProjectFormState, formData): Promise<ProjectFormState> // metadata only; on CREATE redirects to /admin/projects/<newId>/edit
addProjectPhotoAction(prev: PhotoFormState, formData): Promise<PhotoFormState> // fields: project_id, image (File), image_alt
updateProjectPhotoAction(formData): Promise<void>                              // fields: id, project_id, image_alt, sort_order
deleteProjectPhotoAction(formData): Promise<void>                              // fields: id, project_id
deleteProjectAction(formData): Promise<void>                                   // now deletes every gallery object from R2
// PhotoFormState = { status: "idle" } | { status: "error"; message: string }
```

- [ ] **Step 1: Rework `actions.ts`**

Replace the image handling in `saveProjectAction` and `deleteProjectAction`, and add the photo actions. Full new file content:

```ts
"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { services } from "@/lib/content/static/services";

export type ProjectFormState = { status: "idle" } | { status: "error"; message: string };
export type PhotoFormState = { status: "idle" } | { status: "error"; message: string };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// Allowlist, not startsWith("image/") — image/svg+xml can carry scripts and
// /media serves from the app origin.
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const SERVICE_SLUGS = new Set(services.map((s) => s.slug));

function field(formData: FormData, key: string, maxLength: number): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function saveProjectAction(_prevState: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
	const id = field(formData, "id", 20);
	const title = field(formData, "title", 200);
	const slug = field(formData, "slug", 100);
	const detail = field(formData, "detail", 300);
	const serviceSlug = field(formData, "service_slug", 60);
	const timeframe = field(formData, "timeframe", 100);
	const description = field(formData, "description", 2000);
	const sortOrder = Number.parseInt(field(formData, "sort_order", 10), 10);

	if (!title) return { status: "error", message: "Add a title." };
	if (!SLUG_PATTERN.test(slug)) return { status: "error", message: "Slug must be lowercase letters, numbers and hyphens." };
	if (!detail) return { status: "error", message: "Add the one-line detail (shown on the home marquee)." };
	if (!SERVICE_SLUGS.has(serviceSlug)) return { status: "error", message: "Pick the service this project belongs to." };
	if (!timeframe) return { status: "error", message: "Add the timeframe." };
	if (!description) return { status: "error", message: "Add the description." };
	if (Number.isNaN(sortOrder)) return { status: "error", message: "Sort order must be a number." };

	const { env } = await getCloudflareContext({ async: true });
	const now = new Date().toISOString();
	let createdId: number | null = null;

	try {
		if (id) {
			await env.DB.prepare(
				`UPDATE projects SET slug = ?, title = ?, detail = ?, service_slug = ?, timeframe = ?, description = ?,
				 sort_order = ?, updated_at = ? WHERE id = ?`,
			)
				.bind(slug, title, detail, serviceSlug, timeframe, description, sortOrder, now, id)
				.run();
		} else {
			const result = await env.DB.prepare(
				`INSERT INTO projects (slug, title, detail, service_slug, timeframe, description, sort_order, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			)
				.bind(slug, title, detail, serviceSlug, timeframe, description, sortOrder, now, now)
				.run();
			createdId = Number(result.meta.last_row_id);
		}
	} catch (error) {
		const message = error instanceof Error && error.message.includes("UNIQUE") ? "That slug is already in use." : "Save failed — try again.";
		if (!(error instanceof Error && error.message.includes("UNIQUE"))) console.error("Project save failed", error);
		return { status: "error", message };
	}

	// New projects land on the edit page so photos can be added straight away.
	redirect(createdId !== null ? `/admin/projects/${createdId}/edit` : "/admin/projects");
}

export async function addProjectPhotoAction(_prevState: PhotoFormState, formData: FormData): Promise<PhotoFormState> {
	const projectId = field(formData, "project_id", 20);
	const imageAlt = field(formData, "image_alt", 300);
	const image = formData.get("image");

	if (!projectId) return { status: "error", message: "Missing project." };
	if (!(image instanceof File) || image.size === 0) return { status: "error", message: "Choose a photo to upload." };
	if (!ALLOWED_IMAGE_TYPES.has(image.type)) return { status: "error", message: "Use a JPEG, PNG, WEBP, AVIF or GIF photo." };
	if (image.size > MAX_IMAGE_BYTES) return { status: "error", message: "The photo must be under 5MB." };

	const { env } = await getCloudflareContext({ async: true });
	const project = await env.DB.prepare("SELECT slug FROM projects WHERE id = ?").bind(projectId).first<{ slug: string }>();
	if (!project) return { status: "error", message: "That project no longer exists." };

	// Fresh timestamped key (never reused) so /media can cache immutably.
	const ext = (image.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "jpg";
	const imageKey = `projects/${project.slug}-${Date.now()}.${ext}`;
	await env.PROJECT_IMAGES.put(imageKey, await image.arrayBuffer(), {
		httpMetadata: { contentType: image.type },
	});

	try {
		await env.DB.prepare(
			`INSERT INTO project_images (project_id, image_key, image_alt, sort_order, created_at)
			 VALUES (?, ?, ?, COALESCE((SELECT MAX(sort_order) + 1 FROM project_images WHERE project_id = ?), 0), ?)`,
		)
			.bind(projectId, imageKey, imageAlt || null, projectId, new Date().toISOString())
			.run();
	} catch (error) {
		// A failed write must not leave the fresh upload orphaned in R2.
		await env.PROJECT_IMAGES.delete(imageKey).catch(() => {});
		console.error("Photo add failed", error);
		return { status: "error", message: "Upload failed — try again." };
	}

	redirect(`/admin/projects/${projectId}/edit`);
}

export async function updateProjectPhotoAction(formData: FormData): Promise<void> {
	const id = field(formData, "id", 20);
	const projectId = field(formData, "project_id", 20);
	const imageAlt = field(formData, "image_alt", 300);
	const sortOrder = Number.parseInt(field(formData, "sort_order", 10), 10);
	if (!id || !projectId || Number.isNaN(sortOrder)) return;

	const { env } = await getCloudflareContext({ async: true });
	await env.DB.prepare("UPDATE project_images SET image_alt = ?, sort_order = ? WHERE id = ? AND project_id = ?")
		.bind(imageAlt || null, sortOrder, id, projectId)
		.run();

	redirect(`/admin/projects/${projectId}/edit`);
}

export async function deleteProjectPhotoAction(formData: FormData): Promise<void> {
	const id = field(formData, "id", 20);
	const projectId = field(formData, "project_id", 20);
	if (!id || !projectId) return;

	const { env } = await getCloudflareContext({ async: true });
	const existing = await env.DB.prepare("SELECT image_key FROM project_images WHERE id = ? AND project_id = ?")
		.bind(id, projectId)
		.first<{ image_key: string }>();
	await env.DB.prepare("DELETE FROM project_images WHERE id = ? AND project_id = ?").bind(id, projectId).run();
	if (existing) {
		await env.PROJECT_IMAGES.delete(existing.image_key).catch(() => {});
	}

	redirect(`/admin/projects/${projectId}/edit`);
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
	const id = field(formData, "id", 20);
	if (!id) return;

	const { env } = await getCloudflareContext({ async: true });
	const { results: photos } = await env.DB.prepare("SELECT image_key FROM project_images WHERE project_id = ?")
		.bind(id)
		.all<{ image_key: string }>();
	// ON DELETE CASCADE removes the rows; the objects need explicit deletes.
	await env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(id).run();
	for (const photo of photos) {
		await env.PROJECT_IMAGES.delete(photo.image_key).catch(() => {});
	}

	redirect("/admin/projects");
}
```

- [ ] **Step 2: Strip photo fields from `project-form.tsx`**

In `ProjectFormValues` remove `imageKey: string | null;` and `imageAlt: string;`. In the JSX remove the two `.field` divs for `p-image` and `p-image-alt` (the file input and alt input). Everything else stays.

- [ ] **Step 3: Add the photos section to the edit page**

Replace `src/app/admin/(protected)/projects/[id]/edit/page.tsx` content with:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { services } from "@/lib/content/static/services";
import { pageGutter } from "@/lib/style-tokens";
import ProjectForm from "../../project-form";
import ProjectPhotos from "../../project-photos";

export const metadata: Metadata = { title: "Edit project — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

interface ProjectEditRow {
	id: number;
	slug: string;
	title: string;
	detail: string;
	service_slug: string;
	timeframe: string;
	description: string;
	sort_order: number;
}

interface PhotoRow {
	id: number;
	image_key: string;
	image_alt: string | null;
	sort_order: number;
}

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const { env } = await getCloudflareContext({ async: true });
	const row = await env.DB.prepare(
		"SELECT id, slug, title, detail, service_slug, timeframe, description, sort_order FROM projects WHERE id = ?",
	)
		.bind(id)
		.first<ProjectEditRow>();

	if (!row) {
		notFound();
	}

	const { results: photos } = await env.DB.prepare(
		"SELECT id, image_key, image_alt, sort_order FROM project_images WHERE project_id = ? ORDER BY sort_order, id",
	)
		.bind(id)
		.all<PhotoRow>();

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 24px" }}>
				Edit project
			</h1>
			<ProjectForm
				serviceOptions={services.map((s) => ({ slug: s.slug, title: s.title }))}
				initial={{
					id: String(row.id),
					title: row.title,
					slug: row.slug,
					detail: row.detail,
					serviceSlug: row.service_slug,
					timeframe: row.timeframe,
					description: row.description,
					sortOrder: row.sort_order,
				}}
			/>
			<ProjectPhotos
				projectId={String(row.id)}
				photos={photos.map((p) => ({ id: String(p.id), imageKey: p.image_key, imageAlt: p.image_alt ?? "", sortOrder: p.sort_order }))}
			/>
		</div>
	);
}
```

- [ ] **Step 4: Create the `ProjectPhotos` component**

Create `src/app/admin/(protected)/projects/project-photos.tsx`. The first photo by sort order is the public cover, so the section says so. Per-photo rows are plain server-action forms (no client state needed); the add form uses `useActionState` for upload errors, so it's a client component:

```tsx
"use client";

import { useActionState } from "react";
import {
	addProjectPhotoAction,
	deleteProjectPhotoAction,
	updateProjectPhotoAction,
	type PhotoFormState,
} from "./actions";

const initialState: PhotoFormState = { status: "idle" };

export interface ProjectPhotoValues {
	id: string;
	imageKey: string;
	imageAlt: string;
	sortOrder: number;
}

export default function ProjectPhotos({ projectId, photos }: { projectId: string; photos: ProjectPhotoValues[] }) {
	const [state, addAction, isPending] = useActionState(addProjectPhotoAction, initialState);

	return (
		<section style={{ marginTop: 40, maxWidth: 760 }}>
			<h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 6px" }}>
				Photos
			</h2>
			<p style={{ fontSize: 13, lineHeight: "20px", margin: "0 0 16px", color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>
				The photo with the lowest sort order is the cover shown on the projects page and home marquee.
			</p>

			{photos.map((photo) => (
				<form
					key={photo.id}
					action={updateProjectPhotoAction}
					style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12, padding: "14px 0", borderTop: "1px solid var(--color-divider)" }}
				>
					<input type="hidden" name="id" value={photo.id} />
					<input type="hidden" name="project_id" value={projectId} />
					{/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail, no optimizer for /media */}
					<img src={`/media/${photo.imageKey}`} alt={photo.imageAlt || "Project photo"} style={{ width: 96, height: 72, objectFit: "cover", display: "block" }} />
					<div className="field" style={{ flex: "1 1 200px" }}>
						<label htmlFor={`photo-alt-${photo.id}`}>Alt text</label>
						<input className="input" id={`photo-alt-${photo.id}`} name="image_alt" type="text" defaultValue={photo.imageAlt} />
					</div>
					<div className="field" style={{ width: 90 }}>
						<label htmlFor={`photo-sort-${photo.id}`}>Sort</label>
						<input className="input" id={`photo-sort-${photo.id}`} name="sort_order" type="number" defaultValue={photo.sortOrder} />
					</div>
					<button type="submit" className="btn" style={{ minHeight: 38 }}>
						Save
					</button>
					<button type="submit" className="btn" style={{ minHeight: 38 }} formAction={deleteProjectPhotoAction}>
						Delete
					</button>
				</form>
			))}

			<form action={addAction} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12, padding: "14px 0", borderTop: "1px solid var(--color-divider)" }}>
				{state.status === "error" && (
					<div
						role="alert"
						style={{
							flexBasis: "100%",
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
				<input type="hidden" name="project_id" value={projectId} />
				<div className="field" style={{ flex: "1 1 200px" }}>
					<label htmlFor="photo-new">Add photo</label>
					<input className="input" id="photo-new" name="image" type="file" accept="image/*" required />
				</div>
				<div className="field" style={{ flex: "1 1 200px" }}>
					<label htmlFor="photo-new-alt">Alt text</label>
					<input className="input" id="photo-new-alt" name="image_alt" type="text" />
				</div>
				<button type="submit" className="btn btn-primary" style={{ minHeight: 38 }} disabled={isPending}>
					{isPending ? "Uploading…" : "Upload"}
				</button>
			</form>
		</section>
	);
}
```

- [ ] **Step 5: Fix remaining compile errors**

Run: `npx tsc --noEmit`
Expected: errors listing every remaining reference to `imageKey`/`imageAlt` in ProjectForm call sites. Fix each:
- `src/app/admin/(protected)/projects/new/page.tsx`: if it passes `initial`, drop the photo fields; if it passes no `initial`, no change.
Re-run until clean.

- [ ] **Step 6: Verify by hand and with the suite**

Run: `npx playwright test`
Expected: all specs pass (nav, smoke, projects).
Then manually: `npm run dev`, log into `/admin`, edit a project — photos list shows the migrated photo with thumbnail; upload a second photo; reorder it to sort 0; check `/projects/<slug>` shows both and the cover changed on `/projects`.

- [ ] **Step 7: Commit**

```bash
git add "src/app/admin/(protected)/projects/"
git commit -m "feat: manage multiple project photos from the admin"
```

---

### Task 5: Full verification and PR

**Files:** none new.

- [ ] **Step 1: Full local gate**

Run each; all must pass:
```bash
npm run lint
npx tsc --noEmit
npm run build
npx playwright test
```

- [ ] **Step 2: Push and open the PR**

```bash
git push -u origin feat/admin-cms
gh pr create --title "feat: project photo galleries and detail pages" --body "<fill the PR template: summary of migration + admin photos + detail pages; testing notes: lint/tsc/build/playwright pass; note that migration 0006 must be applied to the remote D1 before deploy>"
```

- [ ] **Step 3: Remote migration note**

The production D1 needs `npx wrangler d1 migrations apply DB --remote` as part of releasing this PR (after merge, before/with deploy). Put this in the PR description prominently.
