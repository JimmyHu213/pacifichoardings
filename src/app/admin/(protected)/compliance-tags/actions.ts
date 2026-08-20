"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";

function field(formData: FormData, key: string, maxLength: number): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

// Single-page editor: empty submissions just redirect back — with one text
// field per row there's nothing useful to report, and required inputs stop
// it client-side anyway.
export async function addComplianceTagAction(formData: FormData): Promise<void> {
	await requireAdminSession();

	const label = field(formData, "label", 100);
	const accent = formData.get("accent") === "on" ? 1 : 0;
	const sortOrder = Number.parseInt(field(formData, "sort_order", 10), 10) || 0;

	if (label) {
		const { env } = await getCloudflareContext({ async: true });
		const now = new Date().toISOString();
		await env.DB.prepare("INSERT INTO compliance_tags (label, accent, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
			.bind(label, accent, sortOrder, now, now)
			.run();
	}

	redirect("/admin/compliance-tags");
}

export async function updateComplianceTagAction(formData: FormData): Promise<void> {
	await requireAdminSession();

	const id = field(formData, "id", 20);
	const label = field(formData, "label", 100);
	const accent = formData.get("accent") === "on" ? 1 : 0;
	const sortOrder = Number.parseInt(field(formData, "sort_order", 10), 10) || 0;

	if (id && label) {
		const { env } = await getCloudflareContext({ async: true });
		await env.DB.prepare("UPDATE compliance_tags SET label = ?, accent = ?, sort_order = ?, updated_at = ? WHERE id = ?")
			.bind(label, accent, sortOrder, new Date().toISOString(), id)
			.run();
	}

	redirect("/admin/compliance-tags");
}

export async function deleteComplianceTagAction(formData: FormData): Promise<void> {
	await requireAdminSession();

	const id = field(formData, "id", 20);
	if (id) {
		const { env } = await getCloudflareContext({ async: true });
		await env.DB.prepare("DELETE FROM compliance_tags WHERE id = ?").bind(id).run();
	}

	redirect("/admin/compliance-tags");
}
