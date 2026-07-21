"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { services } from "@/lib/content/static/services";

export type ProjectFormState = { status: "idle" } | { status: "error"; message: string };

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
	const imageAlt = field(formData, "image_alt", 300);
	const sortOrder = Number.parseInt(field(formData, "sort_order", 10), 10);

	if (!title) return { status: "error", message: "Add a title." };
	if (!SLUG_PATTERN.test(slug)) return { status: "error", message: "Slug must be lowercase letters, numbers and hyphens." };
	if (!detail) return { status: "error", message: "Add the one-line detail (shown on the home marquee)." };
	if (!SERVICE_SLUGS.has(serviceSlug)) return { status: "error", message: "Pick the service this project belongs to." };
	if (!timeframe) return { status: "error", message: "Add the timeframe." };
	if (!description) return { status: "error", message: "Add the description." };
	if (Number.isNaN(sortOrder)) return { status: "error", message: "Sort order must be a number." };

	const image = formData.get("image");
	const hasNewImage = image instanceof File && image.size > 0;
	if (hasNewImage) {
		if (!ALLOWED_IMAGE_TYPES.has(image.type)) return { status: "error", message: "Use a JPEG, PNG, WEBP, AVIF or GIF photo." };
		if (image.size > MAX_IMAGE_BYTES) return { status: "error", message: "The photo must be under 5MB." };
	}

	const { env } = await getCloudflareContext({ async: true });

	// Uploads get a fresh timestamped key (never reused), so the /media route
	// can cache immutably; the old object is removed only after D1 commits.
	let newImageKey: string | null = null;
	if (hasNewImage) {
		const ext = (image.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "jpg";
		newImageKey = `projects/${slug}-${Date.now()}.${ext}`;
		await env.PROJECT_IMAGES.put(newImageKey, await image.arrayBuffer(), {
			httpMetadata: { contentType: image.type },
		});
	}

	const now = new Date().toISOString();

	try {
		if (id) {
			const existing = await env.DB.prepare("SELECT image_key FROM projects WHERE id = ?")
				.bind(id)
				.first<{ image_key: string | null }>();
			if (!existing) return { status: "error", message: "That project no longer exists." };

			await env.DB.prepare(
				`UPDATE projects SET slug = ?, title = ?, detail = ?, service_slug = ?, timeframe = ?, description = ?,
				 image_key = COALESCE(?, image_key), image_alt = ?, sort_order = ?, updated_at = ? WHERE id = ?`,
			)
				.bind(slug, title, detail, serviceSlug, timeframe, description, newImageKey, imageAlt || null, sortOrder, now, id)
				.run();

			if (newImageKey && existing.image_key) {
				await env.PROJECT_IMAGES.delete(existing.image_key);
			}
		} else {
			await env.DB.prepare(
				`INSERT INTO projects (slug, title, detail, service_slug, timeframe, description, image_key, image_alt, sort_order, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			)
				.bind(slug, title, detail, serviceSlug, timeframe, description, newImageKey, imageAlt || null, sortOrder, now, now)
				.run();
		}
	} catch (error) {
		// A failed write must not leave the fresh upload orphaned in R2.
		if (newImageKey) await env.PROJECT_IMAGES.delete(newImageKey).catch(() => {});
		const message = error instanceof Error && error.message.includes("UNIQUE") ? "That slug is already in use." : "Save failed — try again.";
		if (!(error instanceof Error && error.message.includes("UNIQUE"))) console.error("Project save failed", error);
		return { status: "error", message };
	}

	redirect("/admin/projects");
}

export async function deleteProjectAction(formData: FormData): Promise<void> {
	const id = field(formData, "id", 20);
	if (!id) return;

	const { env } = await getCloudflareContext({ async: true });
	const existing = await env.DB.prepare("SELECT image_key FROM projects WHERE id = ?").bind(id).first<{ image_key: string | null }>();
	await env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(id).run();
	if (existing?.image_key) {
		await env.PROJECT_IMAGES.delete(existing.image_key).catch(() => {});
	}

	redirect("/admin/projects");
}
