"use client";

import { usePathname } from "next/navigation";
import { pageGutter } from "@/lib/style-tokens";

const navLinks = [
	{ href: "#services", label: "Services" },
	{ href: "#projects", label: "Projects" },
	{ href: "#faq", label: "Q&A" },
];

/* Home page sits over the full-bleed hero video, so the nav there is a
   transparent overlay with light text. Every other page is a normal light
   page and gets a sticky, solid nav instead. */
export default function SiteHeader() {
	const pathname = usePathname();
	const isOverlay = pathname === "/";

	return (
		<nav
			className="nav"
			style={{
				position: isOverlay ? "absolute" : "sticky",
				top: 0,
				left: 0,
				right: 0,
				zIndex: 20,
				background: isOverlay ? "transparent" : "var(--color-bg)",
				borderBottom: isOverlay ? 0 : "1px solid var(--color-divider)",
				boxShadow: isOverlay ? "none" : "var(--shadow-sm)",
				color: isOverlay ? "var(--color-bg)" : "var(--color-text)",
				justifyContent: "center",
				flexWrap: "wrap",
				rowGap: 8,
				paddingInline: `max(${pageGutter}, calc((100% - 1240px) / 2 + ${pageGutter}))`,
			}}
		>
			<span
				className="nav-brand"
				style={{
					textTransform: "uppercase",
					letterSpacing: "0.04em",
					display: "inline-flex",
					alignItems: "baseline",
					gap: 10,
					margin: 0,
				}}
			>
				<span style={{ color: "var(--color-accent-300)", fontWeight: 400 }}>+</span>Pacific Hoardings
			</span>
			{navLinks.map((link) => (
				<a key={link.href} href={link.href} className={isOverlay ? "ph-nav-link" : undefined} style={{ whiteSpace: "nowrap" }}>
					{link.label}
				</a>
			))}
			<a
				href="tel:1300000000"
				style={{
					whiteSpace: "nowrap",
					color: isOverlay ? "var(--color-bg)" : "var(--color-text)",
					fontFeatureSettings: "'tnum' 1",
					fontWeight: 600,
				}}
			>
				1300 000 000
			</a>
			<a
				href="#quote"
				className={isOverlay ? "ph-nav-cta" : undefined}
				style={{
					whiteSpace: "nowrap",
					color: isOverlay ? "var(--color-bg)" : "var(--color-text)",
					fontWeight: 600,
					letterSpacing: "0.06em",
					textTransform: "uppercase",
					borderBottom: `1px solid ${isOverlay ? "var(--color-accent-300)" : "var(--color-accent)"}`,
					paddingBottom: 2,
				}}
			>
				Request a quote
			</a>
		</nav>
	);
}
