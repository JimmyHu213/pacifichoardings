import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { pageGutter } from "@/lib/style-tokens";
import FaqForm from "../../faq-form";

export const metadata: Metadata = { title: "Edit FAQ — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

interface FaqEditRow {
	id: string;
	question: string;
	answer: string;
	sort_order: number;
}

export default async function EditFaqPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const { env } = await getCloudflareContext({ async: true });
	const row = await env.DB.prepare("SELECT id, question, answer, sort_order FROM faqs WHERE id = ?").bind(id).first<FaqEditRow>();

	if (!row) {
		notFound();
	}

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 24px" }}>
				Edit FAQ
			</h1>
			<FaqForm initial={{ id: row.id, question: row.question, answer: row.answer, sortOrder: row.sort_order }} />
		</div>
	);
}
