import { getCloudflareContext } from "@opennextjs/cloudflare";
import { kicker, kickerRule, pageGutter } from "@/lib/style-tokens";
import { addComplianceTagAction, deleteComplianceTagAction, updateComplianceTagAction } from "./actions";

export const dynamic = "force-dynamic";

interface ComplianceTagRow {
	id: number;
	label: string;
	accent: number;
	sort_order: number;
}

export default async function AdminComplianceTagsPage() {
	const { env } = await getCloudflareContext({ async: true });
	const { results } = await env.DB.prepare("SELECT id, label, accent, sort_order FROM compliance_tags ORDER BY sort_order, id").all<ComplianceTagRow>();

	const rowStyle: React.CSSProperties = { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "10px 0", borderBottom: "1px solid var(--color-divider)" };

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter}` }}>
			<span style={kicker}>Compliance tags</span>
			<hr style={kickerRule} />
			<p style={{ fontSize: 14, lineHeight: "22px", maxWidth: "60ch", margin: "0 0 24px", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
				Shown on the about and compliance pages. The accent tag renders in the highlight colour.
			</p>
			<form action={addComplianceTagAction} style={{ ...rowStyle, borderBottom: "2px solid var(--color-text)", paddingBottom: 16 }}>
				<input className="input" name="label" type="text" required placeholder="New compliance tag" style={{ maxWidth: 320 }} />
				<input className="input" name="sort_order" type="number" defaultValue={results.length} style={{ maxWidth: 90 }} aria-label="Sort order" />
				<label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
					<input type="checkbox" name="accent" />
					Accent
				</label>
				<button type="submit" className="btn btn-primary" style={{ minHeight: 36, paddingInline: 18 }}>
					Add
				</button>
			</form>
			{results.map((row) => (
				<div key={row.id} style={rowStyle}>
					<form action={updateComplianceTagAction} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
						<input type="hidden" name="id" value={row.id} />
						<input className="input" name="label" type="text" required defaultValue={row.label} style={{ maxWidth: 320 }} />
						<input className="input" name="sort_order" type="number" defaultValue={row.sort_order} style={{ maxWidth: 90 }} aria-label="Sort order" />
						<label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
							<input type="checkbox" name="accent" defaultChecked={row.accent === 1} />
							Accent
						</label>
						<button type="submit" className="btn btn-secondary" style={{ minHeight: 36, paddingInline: 16 }}>
							Save
						</button>
					</form>
					<form action={deleteComplianceTagAction}>
						<input type="hidden" name="id" value={row.id} />
						<button type="submit" className="btn btn-secondary" style={{ minHeight: 36, paddingInline: 16 }}>
							Delete
						</button>
					</form>
				</div>
			))}
		</div>
	);
}
