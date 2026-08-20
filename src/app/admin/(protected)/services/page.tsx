import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/content";
import { kicker, kickerRule, pageGutter } from "@/lib/style-tokens";

export const metadata: Metadata = { title: "Services — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
	const services = await getServices();

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<span style={kicker}>Services</span>
			<hr style={kickerRule} />
			<p style={{ fontSize: 14, lineHeight: "22px", maxWidth: "60ch", margin: "0 0 24px", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
				The four services are fixed — their content, photos and tags are editable; adding or removing a service is a code change.
			</p>
			<div style={{ overflowX: "auto" }}>
				<table className="table">
					<thead>
						<tr>
							<th>Title</th>
							<th>Slug</th>
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
								<td style={{ whiteSpace: "nowrap" }}>
									<Link href={`/admin/services/${service.slug}/edit`} className="btn btn-secondary" style={{ fontSize: 13 }}>
										Edit
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
