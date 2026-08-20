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
export async function addClientAction(formData: FormData): Promise<void> {
	await requireAdminSession();

	const name = field(formData, "name", 200);
	const sortOrder = Number.parseInt(field(formData, "sort_order", 10), 10) || 0;

	if (name) {
		const { env } = await getCloudflareContext({ async: true });
		const now = new Date().toISOString();
		await env.DB.prepare("INSERT INTO clients (name, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?)")
			.bind(name, sortOrder, now, now)
			.run();
	}

	redirect("/admin/clients");
}

export async function updateClientAction(formData: FormData): Promise<void> {
	await requireAdminSession();

	const id = field(formData, "id", 20);
	const name = field(formData, "name", 200);
	const sortOrder = Number.parseInt(field(formData, "sort_order", 10), 10) || 0;

	if (id && name) {
		const { env } = await getCloudflareContext({ async: true });
		await env.DB.prepare("UPDATE clients SET name = ?, sort_order = ?, updated_at = ? WHERE id = ?")
			.bind(name, sortOrder, new Date().toISOString(), id)
			.run();
	}

	redirect("/admin/clients");
}

export async function deleteClientAction(formData: FormData): Promise<void> {
	await requireAdminSession();

	const id = field(formData, "id", 20);
	if (id) {
		const { env } = await getCloudflareContext({ async: true });
		await env.DB.prepare("DELETE FROM clients WHERE id = ?").bind(id).run();
	}

	redirect("/admin/clients");
}
