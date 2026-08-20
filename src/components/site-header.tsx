"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { pageGutter } from "@/lib/style-tokens";
import type { Service } from "@/lib/content";
import NavDropdown from "./nav-dropdown";
import MobileMenu from "./mobile-menu";

/* Home page sits over the full-bleed hero video, so the nav there is a
   transparent overlay with light text. Every other page is a normal light
   page and gets a sticky, solid nav instead. */
export default function SiteHeader({ services }: { services: Service[] }) {
	const pathname = usePathname();
	const isOverlay = pathname === "/";

	// In-page anchors (#faq, #quote) only resolve on the home page — from any
	// other page they need to point back at "/" first.
	const anchor = (id: string) => (isOverlay ? `#${id}` : `/#${id}`);

	const serviceLinks = services.map((service) => ({ href: `/services/${service.slug}`, label: service.title }));
	const anchorLinks = [
		{ href: "/projects", label: "Projects" },
		{ href: "/about", label: "About" },
		{ href: "/compliance", label: "Compliance" },
		{ href: anchor("faq"), label: "Q&A" },
	];

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
				paddingInline: `max(${pageGutter}, calc((100% - 1240px) / 2 + ${pageGutter}))`,
			}}
		>
			<Link
				href="/"
				className="nav-brand"
				style={{
					textTransform: "uppercase",
					letterSpacing: "0.04em",
					display: "inline-flex",
					alignItems: "baseline",
					gap: 10,
					color: "inherit",
					textDecoration: "none",
				}}
			>
				<span style={{ color: "var(--color-accent-300)", fontWeight: 400 }}>+</span>Pacific Hoardings
			</Link>

			<div className="nav-desktop">
				<NavDropdown label="Services" items={serviceLinks} triggerClassName={isOverlay ? "ph-nav-link" : "ph-nav-link-solid"} />
				{anchorLinks.map((link) => (
					<Link key={link.href} href={link.href} className={isOverlay ? "ph-nav-link" : undefined} style={{ whiteSpace: "nowrap" }}>
						{link.label}
					</Link>
				))}
				<a
					href="tel:1300722477"
					style={{ whiteSpace: "nowrap", color: isOverlay ? "var(--color-bg)" : "var(--color-text)", fontFeatureSettings: "'tnum' 1", fontWeight: 600 }}
				>
					1300 722 477
				</a>
				<Link
					href={anchor("quote")}
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
				</Link>
			</div>

			<MobileMenu servicesItems={serviceLinks} links={anchorLinks} quoteHref={anchor("quote")} />
		</nav>
	);
}
