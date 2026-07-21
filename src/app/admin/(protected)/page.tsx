import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { pageGutter } from "@/lib/style-tokens";

export const metadata: Metadata = { title: "Quote submissions — Pacific Hoardings Admin" };

// Dynamic by necessity — reads cookies() in the parent layout and D1 here,
// neither of which can be prerendered.
export const dynamic = "force-dynamic";

const ROW_LIMIT = 200;

interface QuoteRow {
	id: number;
	name: string;
	company: string | null;
	email: string;
	phone: string | null;
	site_address: string;
	need: string | null;
	details: string | null;
	created_at: string;
}

function formatReceived(iso: string): string {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return iso;
	return date.toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" });
}

export default async function AdminQuotesPage() {
	const { env } = await getCloudflareContext({ async: true });
	const { results } = await env.DB.prepare(
		"SELECT id, name, company, email, phone, site_address, need, details, created_at FROM quote_submissions ORDER BY created_at DESC LIMIT ?",
	)
		.bind(ROW_LIMIT)
		.all<QuoteRow>();

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: 0 }}>
				Quote submissions
			</h1>
			<p style={{ fontSize: 13, lineHeight: "20px", margin: "8px 0 24px", color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>
				Showing the latest {results.length} submission{results.length === 1 ? "" : "s"}
				{results.length === ROW_LIMIT ? ` (capped at ${ROW_LIMIT} — pagination not built yet)` : ""}.
			</p>
			<div style={{ overflowX: "auto" }}>
				<table className="table">
					<thead>
						<tr>
							<th>Received</th>
							<th>Name</th>
							<th>Company</th>
							<th>Phone</th>
							<th>Email</th>
							<th>Need</th>
							<th>Site</th>
							<th>Details</th>
						</tr>
					</thead>
					<tbody>
						{results.length === 0 && (
							<tr>
								<td colSpan={8}>No quote submissions yet.</td>
							</tr>
						)}
						{results.map((row) => (
							<tr key={row.id}>
								<td style={{ whiteSpace: "nowrap" }}>{formatReceived(row.created_at)}</td>
								<td>{row.name}</td>
								<td>{row.company || "—"}</td>
								<td>{row.phone || "—"}</td>
								<td>
									<a href={`mailto:${row.email}`}>{row.email}</a>
								</td>
								<td>{row.need || "—"}</td>
								<td>{row.site_address}</td>
								<td style={{ maxWidth: 320 }}>{row.details || "—"}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
