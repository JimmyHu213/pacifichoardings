import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { services } from "@/lib/content/static/services";
import { pageGutter } from "@/lib/style-tokens";
import ProjectForm from "../../project-form";

export const metadata: Metadata = { title: "Edit project — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

interface ProjectEditRow {
	id: number;
	slug: string;
	title: string;
	detail: string;
	service_slug: string;
	timeframe: string;
	description: string;
	image_key: string | null;
	image_alt: string | null;
	sort_order: number;
}

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const { env } = await getCloudflareContext({ async: true });
	const row = await env.DB.prepare(
		"SELECT id, slug, title, detail, service_slug, timeframe, description, image_key, image_alt, sort_order FROM projects WHERE id = ?",
	)
		.bind(id)
		.first<ProjectEditRow>();

	if (!row) {
		notFound();
	}

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 24px" }}>
				Edit project
			</h1>
			<ProjectForm
				serviceOptions={services.map((s) => ({ slug: s.slug, title: s.title }))}
				initial={{
					id: String(row.id),
					title: row.title,
					slug: row.slug,
					detail: row.detail,
					serviceSlug: row.service_slug,
					timeframe: row.timeframe,
					description: row.description,
					imageKey: row.image_key,
					imageAlt: row.image_alt ?? "",
					sortOrder: row.sort_order,
				}}
			/>
		</div>
	);
}
