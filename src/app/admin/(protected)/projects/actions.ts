"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";
import { getServices } from "@/lib/content";

export type ProjectFormState = { status: "idle" } | { status: "error"; message: string };
export type PhotoFormState = { status: "idle" } | { status: "error"; message: string };

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// Allowlist, not startsWith("image/") — image/svg+xml can carry scripts and
// /media serves from the app origin.
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

function field(formData: FormData, key: string, maxLength: number): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function saveProjectAction(_prevState: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
	await requireAdminSession();

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
	const serviceSlugs = new Set((await getServices()).map((s) => s.slug));
	if (!serviceSlugs.has(serviceSlug)) return { status: "error", message: "Pick the service this project belongs to." };
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
	await requireAdminSession();

	const projectId = field(formData, "project_id", 20);
	const imageAlt = field(formData, "image_alt", 300);
	const image = formData.get("image");
	const width = Number.parseInt(field(formData, "width", 10), 10);
	const height = Number.parseInt(field(formData, "height", 10), 10);

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
			`INSERT INTO project_images (project_id, image_key, image_alt, width, height, sort_order, created_at)
			 VALUES (?, ?, ?, ?, ?, COALESCE((SELECT MAX(sort_order) + 1 FROM project_images WHERE project_id = ?), 0), ?)`,
		)
			.bind(
				projectId,
				imageKey,
				imageAlt || null,
				Number.isFinite(width) && width > 0 ? width : null,
				Number.isFinite(height) && height > 0 ? height : null,
				projectId,
				new Date().toISOString(),
			)
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
	await requireAdminSession();

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
	await requireAdminSession();

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
	await requireAdminSession();

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
