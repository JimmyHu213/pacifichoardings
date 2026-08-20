import type { Metadata } from "next";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getServices } from "@/lib/content";
import { kicker, kickerRule, pageGutter } from "@/lib/style-tokens";
import { deleteServiceAction } from "./actions";

export const metadata: Metadata = { title: "Services — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
	const { env } = await getCloudflareContext({ async: true });
	const [services, { results: counts }] = await Promise.all([
		getServices(),
		env.DB.prepare("SELECT service_slug, COUNT(*) AS n FROM projects GROUP BY service_slug").all<{ service_slug: string; n: number }>(),
	]);
	const projectCountBySlug = new Map(counts.map((row) => [row.service_slug, row.n]));

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<span style={kicker}>Services</span>
			<hr style={kickerRule} />
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
				<p style={{ fontSize: 14, lineHeight: "22px", maxWidth: "60ch", margin: 0, color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
					Add, edit and remove the services shown across the site. A service&rsquo;s slug is its page address and can&rsquo;t be changed once created — to
					rename one, remove it and add it again. Lower sort numbers appear first.
				</p>
				<Link href="/admin/services/new" className="btn btn-primary" style={{ paddingInline: 18, flexShrink: 0 }}>
					New service
				</Link>
			</div>
			<div style={{ overflowX: "auto" }}>
				<table className="table">
					<thead>
						<tr>
							<th>Title</th>
							<th>Slug</th>
							<th>Sort</th>
							<th>Projects</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{services.map((service) => (
							<tr key={service.slug}>
								<td>
									<strong>{service.title}</strong>
								</td>
								<td>{service.slug}</td>
								<td>{service.sortOrder}</td>
								<td>{projectCountBySlug.get(service.slug) ?? 0}</td>
								<td style={{ whiteSpace: "nowrap", display: "flex", gap: 8 }}>
									<Link href={`/admin/services/${service.slug}/edit`} className="btn btn-secondary" style={{ fontSize: 13 }}>
										Edit
									</Link>
									<form action={deleteServiceAction}>
										<input type="hidden" name="slug" value={service.slug} />
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
			<p
				style={{
					fontSize: 13,
					lineHeight: "20px",
					maxWidth: "70ch",
					marginTop: 16,
					color: "color-mix(in srgb, var(--color-text) 70%, transparent)",
				}}
			>
				Deleting a service removes its page and its photos, and drops it from the menu and the quote form. Any projects still tagged with it (see the
				Projects column) keep working — they just show the raw tag until you retag them.
			</p>
		</div>
	);
}
