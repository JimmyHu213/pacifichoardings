import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { pageGutter } from "@/lib/style-tokens";
import StatForm from "../../stat-form";

export const metadata: Metadata = { title: "Edit stat — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

interface StatEditRow {
	id: number;
	value: string;
	label: string;
	detail: string;
	accent: number;
	sort_order: number;
}

export default async function EditStatPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const { env } = await getCloudflareContext({ async: true });
	const row = await env.DB.prepare("SELECT id, value, label, detail, accent, sort_order FROM stats WHERE id = ?").bind(id).first<StatEditRow>();

	if (!row) {
		notFound();
	}

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 24px" }}>
				Edit stat
			</h1>
			<StatForm
				initial={{
					id: String(row.id),
					value: row.value,
					label: row.label,
					detail: row.detail,
					accent: row.accent === 1,
					sortOrder: row.sort_order,
				}}
			/>
		</div>
	);
}
