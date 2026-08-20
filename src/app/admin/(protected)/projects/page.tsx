import type { Metadata } from "next";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getServices } from "@/lib/content";
import { pageGutter } from "@/lib/style-tokens";
import { deleteProjectAction } from "./actions";

export const metadata: Metadata = { title: "Projects — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

interface ProjectListRow {
	id: number;
	slug: string;
	title: string;
	service_slug: string;
	timeframe: string;
	image_key: string | null;
	sort_order: number;
}

export default async function AdminProjectsPage() {
	const { env } = await getCloudflareContext({ async: true });
	const { results } = await env.DB.prepare(
		`SELECT p.id, p.slug, p.title, p.service_slug, p.timeframe, p.sort_order,
			(SELECT pi.image_key FROM project_images pi WHERE pi.project_id = p.id ORDER BY pi.sort_order, pi.id LIMIT 1) AS image_key
		 FROM projects p ORDER BY p.sort_order, p.id`,
	).all<ProjectListRow>();
	const serviceTitleBySlug = new Map((await getServices()).map((s) => [s.slug, s.title]));

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
				<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: 0 }}>
					Projects
				</h1>
				<Link href="/admin/projects/new" className="btn btn-primary" style={{ paddingInline: 18 }}>
					New project
				</Link>
			</div>
			<div style={{ overflowX: "auto" }}>
				<table className="table">
					<thead>
						<tr>
							<th>Photo</th>
							<th>Title</th>
							<th>Service</th>
							<th>Timeframe</th>
							<th>Sort</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{results.length === 0 && (
							<tr>
								<td colSpan={6}>No projects yet.</td>
							</tr>
						)}
						{results.map((row) => (
							<tr key={row.id}>
								<td>
									{row.image_key ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img src={`/media/${row.image_key}`} alt="" style={{ width: 72, height: 54, objectFit: "cover", display: "block" }} />
									) : (
										<span style={{ color: "color-mix(in srgb, var(--color-text) 45%, transparent)" }}>—</span>
									)}
								</td>
								<td>
									<strong>{row.title}</strong>
									<span style={{ display: "block", fontSize: 12, color: "color-mix(in srgb, var(--color-text) 55%, transparent)" }}>{row.slug}</span>
								</td>
								<td>{serviceTitleBySlug.get(row.service_slug) ?? row.service_slug}</td>
								<td>{row.timeframe}</td>
								<td>{row.sort_order}</td>
								<td style={{ whiteSpace: "nowrap" }}>
									<Link href={`/admin/projects/${row.id}/edit`} className="btn btn-secondary" style={{ fontSize: 13, marginRight: 8 }}>
										Edit
									</Link>
									<form action={deleteProjectAction} style={{ display: "inline" }}>
										<input type="hidden" name="id" value={row.id} />
										<button type="submit" className="btn btn-secondary" style={{ fontSize: 13 }}>
											Delete
										</button>
									</form>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
