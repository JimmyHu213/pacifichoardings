import { getCloudflareContext } from "@opennextjs/cloudflare";
import { kicker, kickerRule, pageGutter } from "@/lib/style-tokens";
import { addClientAction, deleteClientAction, updateClientAction } from "./actions";

export const dynamic = "force-dynamic";

interface ClientRow {
	id: number;
	name: string;
	sort_order: number;
}

export default async function AdminClientsPage() {
	const { env } = await getCloudflareContext({ async: true });
	const { results } = await env.DB.prepare("SELECT id, name, sort_order FROM clients ORDER BY sort_order, id").all<ClientRow>();

	const rowStyle: React.CSSProperties = { display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", padding: "10px 0", borderBottom: "1px solid var(--color-divider)" };

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter}` }}>
			<span style={kicker}>Client names</span>
			<hr style={kickerRule} />
			<p style={{ fontSize: 14, lineHeight: "22px", maxWidth: "60ch", margin: "0 0 24px", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
				The &ldquo;Who we work with&rdquo; tags on the about page. Lower sort numbers come first.
			</p>
			<form action={addClientAction} style={{ ...rowStyle, borderBottom: "2px solid var(--color-text)", paddingBottom: 16 }}>
				<input className="input" name="name" type="text" required placeholder="New client name" style={{ maxWidth: 320 }} />
				<input className="input" name="sort_order" type="number" defaultValue={results.length} style={{ maxWidth: 90 }} aria-label="Sort order" />
				<button type="submit" className="btn btn-primary" style={{ minHeight: 36, paddingInline: 18 }}>
					Add
				</button>
			</form>
			{results.map((row) => (
				<div key={row.id} style={rowStyle}>
					<form action={updateClientAction} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
						<input type="hidden" name="id" value={row.id} />
						<input className="input" name="name" type="text" required defaultValue={row.name} style={{ maxWidth: 320 }} />
						<input className="input" name="sort_order" type="number" defaultValue={row.sort_order} style={{ maxWidth: 90 }} aria-label="Sort order" />
						<button type="submit" className="btn btn-secondary" style={{ minHeight: 36, paddingInline: 16 }}>
							Save
						</button>
					</form>
					<form action={deleteClientAction}>
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
