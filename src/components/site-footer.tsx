export default function SiteFooter() {
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
			<span>Pacific Hoarding Pty Ltd · ABN 96 686 186 934</span>
			<span>Morisset, NSW · Servicing Sydney &amp; the Central Coast</span>
		</footer>
	);
}
