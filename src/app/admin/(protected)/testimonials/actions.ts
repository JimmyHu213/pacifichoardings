"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/admin-auth";

export type TestimonialFormState = { status: "idle" } | { status: "error"; message: string };

function field(formData: FormData, key: string, maxLength: number): string {
	const value = formData.get(key);
	return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function saveTestimonialAction(_prevState: TestimonialFormState, formData: FormData): Promise<TestimonialFormState> {
	await requireAdminSession();

	const id = field(formData, "id", 20);
	const quote = field(formData, "quote", 600);
	const source = field(formData, "source", 200);
	const sortOrder = Number.parseInt(field(formData, "sort_order", 10), 10);

	if (!quote) return { status: "error", message: "Add the quote." };
	if (!source) return { status: "error", message: "Add the source line (e.g. — Site manager, Sydney)." };
	if (Number.isNaN(sortOrder)) return { status: "error", message: "Sort order must be a number." };

	const { env } = await getCloudflareContext({ async: true });
	const now = new Date().toISOString();

	try {
		if (id) {
			const result = await env.DB.prepare("UPDATE testimonials SET quote = ?, source = ?, sort_order = ?, updated_at = ? WHERE id = ?")
				.bind(quote, source, sortOrder, now, id)
				.run();
			if (result.meta.changes === 0) return { status: "error", message: "That testimonial no longer exists." };
		} else {
			await env.DB.prepare("INSERT INTO testimonials (quote, source, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)")
				.bind(quote, source, sortOrder, now, now)
				.run();
		}
	} catch (error) {
		console.error("Testimonial save failed", error);
		return { status: "error", message: "Save failed — try again." };
	}

	redirect("/admin/testimonials");
}

export async function deleteTestimonialAction(formData: FormData): Promise<void> {
	await requireAdminSession();

	const id = field(formData, "id", 20);
	if (!id) return;

	const { env } = await getCloudflareContext({ async: true });
	await env.DB.prepare("DELETE FROM testimonials WHERE id = ?").bind(id).run();

	redirect("/admin/testimonials");
}
