import type { Metadata } from "next";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { kicker, kickerRule, pageGutter } from "@/lib/style-tokens";
import { deleteTestimonialAction } from "./actions";

export const metadata: Metadata = { title: "Testimonials — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

interface TestimonialListRow {
	id: number;
	quote: string;
	source: string;
	sort_order: number;
}

export default async function AdminTestimonialsPage() {
	const { env } = await getCloudflareContext({ async: true });
	const { results } = await env.DB.prepare("SELECT id, quote, source, sort_order FROM testimonials ORDER BY sort_order, id").all<TestimonialListRow>();

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
				<span style={kicker}>Testimonials</span>
				<Link href="/admin/testimonials/new" className="btn btn-primary" style={{ paddingInline: 18 }}>
					New testimonial
				</Link>
			</div>
			<hr style={kickerRule} />
			<div style={{ overflowX: "auto" }}>
				<table className="table">
					<thead>
						<tr>
							<th>Quote</th>
							<th>Source</th>
							<th>Sort</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{results.length === 0 && (
							<tr>
								<td colSpan={4}>No testimonials yet.</td>
							</tr>
						)}
						{results.map((row) => (
							<tr key={row.id}>
								<td style={{ maxWidth: 420 }}>{row.quote}</td>
								<td>{row.source}</td>
								<td>{row.sort_order}</td>
								<td style={{ whiteSpace: "nowrap" }}>
									<Link href={`/admin/testimonials/${row.id}/edit`} className="btn btn-secondary" style={{ fontSize: 13, marginRight: 8 }}>
										Edit
									</Link>
									<form action={deleteTestimonialAction} style={{ display: "inline" }}>
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
