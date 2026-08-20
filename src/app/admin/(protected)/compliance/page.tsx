import { getComplianceContent } from "@/lib/content";
import { kicker, kickerRule, pageGutter } from "@/lib/style-tokens";
import ComplianceForm from "./compliance-form";

export const dynamic = "force-dynamic";

export default async function AdminCompliancePage() {
	const compliance = await getComplianceContent();

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter}` }}>
			<span style={kicker}>Compliance page</span>
			<hr style={kickerRule} />
			<p style={{ fontSize: 14, lineHeight: "22px", maxWidth: "60ch", margin: "0 0 24px", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
				This is the /compliance page&rsquo;s content. The tag row is edited under Compliance tags.
			</p>
			<ComplianceForm initial={compliance} />
		</div>
	);
}
