"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";

export type FaqFormState = { status: "idle" } | { status: "error"; message: string };

// Static Service.faqIds[] reference FAQ ids by string, so the id is set once
// at creation and read-only after (see PHASE10-PLAN.md §2).
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function field(formData: FormData, key: string, maxLength: number): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function saveFaqAction(_prevState: FaqFormState, formData: FormData): Promise<FaqFormState> {
	const isEdit = field(formData, "is_edit", 5) === "true";
	const id = field(formData, "id", 100);
	const question = field(formData, "question", 300);
	const answer = field(formData, "answer", 4000);
	const sortOrder = Number.parseInt(field(formData, "sort_order", 10), 10);

	if (!ID_PATTERN.test(id)) return { status: "error", message: "Id must be lowercase letters, numbers and hyphens." };
	if (!question) return { status: "error", message: "Add the question." };
	if (!answer) return { status: "error", message: "Add the answer." };
	if (Number.isNaN(sortOrder)) return { status: "error", message: "Sort order must be a number." };

	const { env } = await getCloudflareContext({ async: true });
	const now = new Date().toISOString();

	try {
		if (isEdit) {
			const result = await env.DB.prepare("UPDATE faqs SET question = ?, answer = ?, sort_order = ?, updated_at = ? WHERE id = ?")
				.bind(question, answer, sortOrder, now, id)
				.run();
			if (result.meta.changes === 0) return { status: "error", message: "That FAQ no longer exists." };
		} else {
			await env.DB.prepare("INSERT INTO faqs (id, question, answer, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
				.bind(id, question, answer, sortOrder, now, now)
				.run();
		}
	} catch (error) {
		if (error instanceof Error && error.message.includes("UNIQUE")) {
			return { status: "error", message: "That id is already in use." };
		}
		console.error("FAQ save failed", error);
		return { status: "error", message: "Save failed — try again." };
	}

	redirect("/admin/faqs");
}

export async function deleteFaqAction(formData: FormData): Promise<void> {
	const id = field(formData, "id", 100);
	if (!id) return;

	const { env } = await getCloudflareContext({ async: true });
	await env.DB.prepare("DELETE FROM faqs WHERE id = ?").bind(id).run();

	redirect("/admin/faqs");
}
