import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getServices } from "@/lib/content";
import { pageGutter } from "@/lib/style-tokens";
import ProjectForm from "../../project-form";
import ProjectPhotos from "../../project-photos";

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
	sort_order: number;
}

interface PhotoRow {
	id: number;
	image_key: string;
	image_alt: string | null;
	sort_order: number;
}

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const { env } = await getCloudflareContext({ async: true });
	const row = await env.DB.prepare(
		"SELECT id, slug, title, detail, service_slug, timeframe, description, sort_order FROM projects WHERE id = ?",
	)
		.bind(id)
		.first<ProjectEditRow>();

	if (!row) {
		notFound();
	}

	const { results: photos } = await env.DB.prepare(
		"SELECT id, image_key, image_alt, sort_order FROM project_images WHERE project_id = ? ORDER BY sort_order, id",
	)
		.bind(id)
		.all<PhotoRow>();
	const services = await getServices();

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
					sortOrder: row.sort_order,
				}}
			/>
			<ProjectPhotos
				projectId={String(row.id)}
				photos={photos.map((p) => ({ id: String(p.id), imageKey: p.image_key, imageAlt: p.image_alt ?? "", sortOrder: p.sort_order }))}
			/>
		</div>
	);
}
