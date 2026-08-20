import type { Metadata } from "next";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { kicker, kickerRule, pageGutter } from "@/lib/style-tokens";
import { deleteStatAction } from "./actions";

export const metadata: Metadata = { title: "Stats — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

interface StatListRow {
	id: number;
	value: string;
	label: string;
	detail: string;
	accent: number;
	sort_order: number;
}

export default async function AdminStatsPage() {
	const { env } = await getCloudflareContext({ async: true });
	const { results } = await env.DB.prepare("SELECT id, value, label, detail, accent, sort_order FROM stats ORDER BY sort_order, id").all<StatListRow>();

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
				<span style={kicker}>Stats</span>
				<Link href="/admin/stats/new" className="btn btn-primary" style={{ paddingInline: 18 }}>
					New stat
				</Link>
			</div>
			<hr style={kickerRule} />
			<div style={{ overflowX: "auto" }}>
				<table className="table">
					<thead>
						<tr>
							<th>Value</th>
							<th>Label</th>
							<th>Detail</th>
							<th>Accent</th>
							<th>Sort</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{results.length === 0 && (
							<tr>
								<td colSpan={6}>No stats yet.</td>
							</tr>
						)}
						{results.map((row) => (
							<tr key={row.id}>
								<td style={{ whiteSpace: "nowrap" }}>{row.value}</td>
								<td>{row.label}</td>
								<td>{row.detail}</td>
								<td>{row.accent === 1 ? "Yes" : "—"}</td>
								<td>{row.sort_order}</td>
								<td style={{ whiteSpace: "nowrap" }}>
									<Link href={`/admin/stats/${row.id}/edit`} className="btn btn-secondary" style={{ fontSize: 13, marginRight: 8 }}>
										Edit
									</Link>
									<form action={deleteStatAction} style={{ display: "inline" }}>
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
