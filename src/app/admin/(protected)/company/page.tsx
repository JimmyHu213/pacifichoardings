import { getCompanyInfo } from "@/lib/content";
import { kicker, kickerRule, pageGutter } from "@/lib/style-tokens";
import CompanyForm from "./company-form";

export const dynamic = "force-dynamic";

export default async function AdminCompanyPage() {
	const company = await getCompanyInfo();

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter}` }}>
			<span style={kicker}>Company info</span>
			<hr style={kickerRule} />
			<p style={{ fontSize: 14, lineHeight: "22px", maxWidth: "60ch", margin: "0 0 24px", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
				These details appear in the site header, footer, contact block and quote form. Changes go live as soon as you save.
			</p>
			<CompanyForm initial={company} />
		</div>
	);
}
