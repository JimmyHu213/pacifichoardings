"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { requireAdminSession } from "@/lib/admin-auth";

export type ComplianceFormState = { status: "idle" } | { status: "saved" } | { status: "error"; message: string };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
// Allowlist, not startsWith("image/") — image/svg+xml can carry scripts and
// /media serves from the app origin. Mirrors about/actions.ts.
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

function field(formData: FormData, key: string, maxLength: number): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

const TEXT_FIELDS: { name: string; key: string; label: string; max: number }[] = [
	{ name: "headline", key: "compliance.headline", label: "headline", max: 200 },
	{ name: "intro", key: "compliance.intro", label: "intro paragraph", max: 1000 },
	{ name: "standards_body", key: "compliance.standards_body", label: "standards paragraph", max: 2000 },
	{ name: "permits_body", key: "compliance.permits_body", label: "permits paragraph", max: 2000 },
	{ name: "safework_body", key: "compliance.safework_body", label: "safework paragraph", max: 2000 },
	{ name: "insurance_body", key: "compliance.insurance_body", label: "insurance paragraph", max: 2000 },
	{ name: "handover_body", key: "compliance.handover_body", label: "handover paragraph", max: 2000 },
	{ name: "permit_image_alt", key: "compliance.permit_image_alt", label: "permits photo description", max: 300 },
	{ name: "crew_image_alt", key: "compliance.crew_image_alt", label: "crew photo description", max: 300 },
];

interface PhotoSlot {
	fileField: string;
	settingKey: string;
	r2Prefix: string;
}

const PHOTO_SLOTS: PhotoSlot[] = [
	{ fileField: "permit_photo", settingKey: "compliance.permit_image", r2Prefix: "compliance/permit" },
	{ fileField: "crew_photo", settingKey: "compliance.crew_image", r2Prefix: "compliance/crew" },
];

interface CardGroup {
	prefix: string;
	settingKey: string;
	cardLabel: string;
}

const CARD_GROUPS: CardGroup[] = [
	{ prefix: "standards", settingKey: "compliance.standards_cards", cardLabel: "standards card" },
	{ prefix: "handover", settingKey: "compliance.handover_cards", cardLabel: "handover card" },
];

export async function saveComplianceAction(_prevState: ComplianceFormState, formData: FormData): Promise<ComplianceFormState> {
	await requireAdminSession();

	const values = TEXT_FIELDS.map((f) => ({ ...f, value: field(formData, f.name, f.max) }));
	const missing = values.find((f) => !f.value);
	if (missing) return { status: "error", message: `Add the ${missing.label}.` };

	const cardsByGroup = new Map<string, { label: string; detail: string }[]>();
	for (const group of CARD_GROUPS) {
		const cards: { label: string; detail: string }[] = [];
		for (let i = 0; i < 4; i++) {
			const label = field(formData, `${group.prefix}_label_${i}`, 100);
			const detail = field(formData, `${group.prefix}_detail_${i}`, 300);
			if (!label || !detail) return { status: "error", message: `Fill in ${group.cardLabel} ${i + 1}.` };
			cards.push({ label, detail });
		}
		cardsByGroup.set(group.settingKey, cards);
	}

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
		for (const group of CARD_GROUPS) {
			statements.push(
				env.DB.prepare(
					"INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
				).bind(group.settingKey, JSON.stringify(cardsByGroup.get(group.settingKey)), now),
			);
		}
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
		console.error("Compliance save failed", error);
		return { status: "error", message: "Save failed — try again." };
	}

	return { status: "saved" };
}
