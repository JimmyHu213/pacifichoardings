import { getCompanyInfo } from "@/lib/content";

export default async function SiteFooter() {
	const company = await getCompanyInfo();

	return (
		<footer
			style={{
				gridColumn: "1 / -1",
				paddingTop: 24,
				borderTop: "1px solid color-mix(in srgb, var(--color-bg) 22%, transparent)",
				fontSize: 13,
				lineHeight: "24px",
				color: "color-mix(in srgb, var(--color-bg) 65%, transparent)",
				display: "flex",
				flexWrap: "wrap",
				gap: "8px 32px",
				justifyContent: "space-between",
			}}
		>
			<span>
				{company.legalName} · ABN {company.abn}
			</span>
			<span>
				{company.yardSuburb} · {company.coverage}
			</span>
		</footer>
	);
}
