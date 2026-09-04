"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";

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
	await requireAdminSession();

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

	// React resets these uncontrolled inputs to their defaultValue once the
	// action settles, and those defaults come from the server. Without a
	// revalidate the page keeps its pre-save data, so the fields visibly snap
	// back to the old text and the save looks like it failed.
	revalidatePath("/admin/about");
	revalidatePath("/about");

	return { status: "saved" };
}
