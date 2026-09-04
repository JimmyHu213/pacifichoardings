"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";

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
	await requireAdminSession();

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

	// Without this the form's inputs repopulate from pre-save server data when
	// React resets them, making a successful save look like it did nothing.
	// Company details also sit in the header and footer of every public page,
	// hence revalidating from the root layout down.
	revalidatePath("/admin/company");
	revalidatePath("/", "layout");

	return { status: "saved" };
}
