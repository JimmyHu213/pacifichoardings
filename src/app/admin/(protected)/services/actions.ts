"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireAdminSession } from "@/lib/admin-auth";

export type ServiceFormState = { status: "idle" } | { status: "saved" } | { status: "error"; message: string };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// Allowlist, not startsWith("image/") — image/svg+xml can carry scripts and
// /media serves from the app origin.
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function field(formData: FormData, key: string, maxLength: number): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function saveServiceAction(_prevState: ServiceFormState, formData: FormData): Promise<ServiceFormState> {
	await requireAdminSession();

	const slug = field(formData, "slug", 100);
	// Slugs are locked after creation — this action only ever updates an
	// existing row, and the pre-flight read below rejects unknown slugs.
	if (!SLUG_PATTERN.test(slug)) return { status: "error", message: "Unknown service." };

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

	// Photo slots: validate both before writing anything (mirrors about/actions.ts).
	const uploads: { index: number; file: File }[] = [];
	for (const index of [0, 1]) {
		const file = formData.get(`photo_${index}`);
		if (file instanceof File && file.size > 0) {
			if (!ALLOWED_IMAGE_TYPES.has(file.type)) return { status: "error", message: "Use a JPEG, PNG, WEBP, AVIF or GIF photo." };
			if (file.size > MAX_IMAGE_BYTES) return { status: "error", message: "Photos must be under 5MB." };
			uploads.push({ index, file });
		}
	}
	const alts = [field(formData, "image_alt_0", 300), field(formData, "image_alt_1", 300)];
	if (!alts[0] || !alts[1]) return { status: "error", message: "Add both photo descriptions." };

	const { env } = await getCloudflareContext({ async: true });
	const now = new Date().toISOString();

	let images: { key: string; alt: string }[];
	try {
		const existing = await env.DB.prepare("SELECT images FROM services WHERE slug = ?").bind(slug).first<{ images: string }>();
		if (!existing) return { status: "error", message: "That service no longer exists." };
		images = (JSON.parse(existing.images) as { key: string; alt: string }[]).map((img, i) => ({ key: img.key, alt: alts[i] }));
	} catch (error) {
		console.error("Service pre-flight read failed", error);
		return { status: "error", message: "That service isn't in the database yet — apply the migration first." };
	}

	// Fresh timestamped keys (never reused); old objects removed only after the
	// D1 write commits; a failed write deletes the fresh uploads.
	const newKeys: { index: number; key: string }[] = [];
	try {
		for (const { index, file } of uploads) {
			const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "jpg";
			const key = `services/${slug}/${index}-${Date.now()}.${ext}`;
			await env.PROJECT_IMAGES.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
			newKeys.push({ index, key });
		}
		const oldKeys: string[] = [];
		for (const { index, key } of newKeys) {
			if (images[index].key) oldKeys.push(images[index].key);
			images[index] = { key, alt: images[index].alt };
		}

		await env.DB.prepare(
			`UPDATE services SET title = ?, tagline = ?, body = ?, overview = ?, when_you_need_it = ?,
			 specs = ?, process = ?, compliance_tags = ?, images = ?, updated_at = ? WHERE slug = ?`,
		)
			.bind(
				title,
				tagline,
				body,
				overview,
				whenYouNeedIt,
				JSON.stringify(specs),
				JSON.stringify(process),
				JSON.stringify(complianceTags),
				JSON.stringify(images),
				now,
				slug,
			)
			.run();

		for (const oldKey of oldKeys) {
			await env.PROJECT_IMAGES.delete(oldKey).catch(() => {});
		}
	} catch (error) {
		for (const { key } of newKeys) {
			await env.PROJECT_IMAGES.delete(key).catch(() => {});
		}
		console.error("Service save failed", error);
		return { status: "error", message: "Save failed — try again." };
	}

	return { status: "saved" };
}
