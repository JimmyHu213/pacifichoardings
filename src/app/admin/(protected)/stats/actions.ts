"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

export type StatFormState = { status: "idle" } | { status: "error"; message: string };

function field(formData: FormData, key: string, maxLength: number): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function saveStatAction(_prevState: StatFormState, formData: FormData): Promise<StatFormState> {
	const id = field(formData, "id", 20);
	const value = field(formData, "value", 40);
	const label = field(formData, "label", 100);
	const detail = field(formData, "detail", 200);
	const accent = formData.get("accent") === "on" ? 1 : 0;
	const sortOrder = Number.parseInt(field(formData, "sort_order", 10), 10);

	if (!value) return { status: "error", message: "Add the big value (e.g. AS 4687)." };
	if (!label) return { status: "error", message: "Add the label." };
	if (!detail) return { status: "error", message: "Add the detail line." };
	if (Number.isNaN(sortOrder)) return { status: "error", message: "Sort order must be a number." };

	const { env } = await getCloudflareContext({ async: true });
	const now = new Date().toISOString();

	try {
		if (id) {
			const result = await env.DB.prepare(
				"UPDATE stats SET value = ?, label = ?, detail = ?, accent = ?, sort_order = ?, updated_at = ? WHERE id = ?",
			)
				.bind(value, label, detail, accent, sortOrder, now, id)
				.run();
			if (result.meta.changes === 0) return { status: "error", message: "That stat no longer exists." };
		} else {
			await env.DB.prepare(
				"INSERT INTO stats (value, label, detail, accent, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
			)
				.bind(value, label, detail, accent, sortOrder, now, now)
				.run();
		}
	} catch (error) {
		console.error("Stat save failed", error);
		return { status: "error", message: "Save failed — try again." };
	}

	redirect("/admin/stats");
}

export async function deleteStatAction(formData: FormData): Promise<void> {
	const id = field(formData, "id", 20);
	if (!id) return;

	const { env } = await getCloudflareContext({ async: true });
	await env.DB.prepare("DELETE FROM stats WHERE id = ?").bind(id).run();

	redirect("/admin/stats");
}
