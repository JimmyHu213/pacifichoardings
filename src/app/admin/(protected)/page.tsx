import type { Metadata } from "next";
import Link from "next/link";
import { pageGutter } from "@/lib/style-tokens";

export const metadata: Metadata = { title: "Dashboard — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

const sections = [
	{ href: "/admin/quotes", title: "Quotes", detail: "Quote requests from the website, newest first." },
	{ href: "/admin/projects", title: "Projects", detail: "The project gallery — add, edit and photograph installations." },
	{ href: "/admin/faqs", title: "FAQs", detail: "The questions answered on the home, compliance and service pages." },
];

export default function AdminDashboardPage() {
	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 24px" }}>
				Dashboard
			</h1>
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 320px))", gap: 20 }}>
				{sections.map((section) => (
					<Link
						key={section.href}
						href={section.href}
						style={{
							display: "block",
							padding: 20,
							border: "1px solid var(--color-divider)",
							color: "inherit",
							textDecoration: "none",
							background: "var(--color-surface)",
						}}
					>
						<strong style={{ display: "block", fontSize: 16, textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: 6 }}>
							{section.title}
						</strong>
						<span style={{ fontSize: 13, lineHeight: "20px", color: "color-mix(in srgb, var(--color-text) 65%, transparent)" }}>
							{section.detail}
						</span>
					</Link>
				))}
			</div>
		</div>
	);
}
