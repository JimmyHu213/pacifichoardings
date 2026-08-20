import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { pageGutter } from "@/lib/style-tokens";
import TestimonialForm from "../../testimonial-form";

export const metadata: Metadata = { title: "Edit testimonial — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

interface TestimonialEditRow {
	id: number;
	quote: string;
	source: string;
	sort_order: number;
}

export default async function EditTestimonialPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const { env } = await getCloudflareContext({ async: true });
	const row = await env.DB.prepare("SELECT id, quote, source, sort_order FROM testimonials WHERE id = ?").bind(id).first<TestimonialEditRow>();

	if (!row) {
		notFound();
	}

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 24px" }}>
				Edit testimonial
			</h1>
			<TestimonialForm
				initial={{
					id: String(row.id),
					quote: row.quote,
					source: row.source,
					sortOrder: row.sort_order,
				}}
			/>
		</div>
	);
}
