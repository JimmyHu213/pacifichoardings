import type { Metadata } from "next";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { pageGutter } from "@/lib/style-tokens";
import { deleteFaqAction } from "./actions";

export const metadata: Metadata = { title: "FAQs — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

interface FaqListRow {
	id: string;
	question: string;
	sort_order: number;
}

export default async function AdminFaqsPage() {
	const { env } = await getCloudflareContext({ async: true });
	const { results } = await env.DB.prepare("SELECT id, question, sort_order FROM faqs ORDER BY sort_order, id").all<FaqListRow>();

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 24 }}>
				<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: 0 }}>
					FAQs
				</h1>
				<Link href="/admin/faqs/new" className="btn btn-primary" style={{ paddingInline: 18 }}>
					New FAQ
				</Link>
			</div>
			<div style={{ overflowX: "auto" }}>
				<table className="table">
					<thead>
						<tr>
							<th>Id</th>
							<th>Question</th>
							<th>Sort</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{results.length === 0 && (
							<tr>
								<td colSpan={4}>No FAQs yet.</td>
							</tr>
						)}
						{results.map((row) => (
							<tr key={row.id}>
								<td style={{ whiteSpace: "nowrap" }}>{row.id}</td>
								<td>{row.question}</td>
								<td>{row.sort_order}</td>
								<td style={{ whiteSpace: "nowrap" }}>
									<Link href={`/admin/faqs/${row.id}/edit`} className="btn btn-secondary" style={{ fontSize: 13, marginRight: 8 }}>
										Edit
									</Link>
									<form action={deleteFaqAction} style={{ display: "inline" }}>
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
