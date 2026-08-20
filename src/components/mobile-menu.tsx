"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import NavDropdown, { type NavDropdownItem } from "./nav-dropdown";

export default function MobileMenu({
	servicesItems,
	links,
	quoteHref,
	phone,
}: {
	servicesItems: NavDropdownItem[];
	links: NavDropdownItem[];
	quoteHref: string;
	phone: string;
}) {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	// Close on route change (e.g. tapping a link that navigates). Adjusting
	// state during render, not in an effect, per React's guidance for
	// resetting state when a prop changes.
	const [prevPathname, setPrevPathname] = useState(pathname);
	if (pathname !== prevPathname) {
		setPrevPathname(pathname);
		setOpen(false);
	}

	useEffect(() => {
		if (!open) return;
		function onKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") setOpen(false);
		}
		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [open]);

	return (
		<>
			<button
				type="button"
				className="nav-hamburger"
				aria-expanded={open}
				aria-controls="mobile-menu-panel"
				aria-label={open ? "Close menu" : "Menu"}
				onClick={() => setOpen((v) => !v)}
			>
				<span className={`nav-hamburger-icon${open ? " is-open" : ""}`} aria-hidden="true">
					<span></span>
					<span></span>
					<span></span>
				</span>
			</button>
			<div id="mobile-menu-panel" className="mobile-menu-panel" hidden={!open}>
				<NavDropdown label="Services" items={servicesItems} variant="accordion" />
				{links.map((link) => (
					<Link key={link.href} href={link.href} className="mobile-menu-link" onClick={() => setOpen(false)}>
						{link.label}
					</Link>
				))}
				<a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="mobile-menu-link" onClick={() => setOpen(false)}>
					{phone}
				</a>
				<Link href={quoteHref} className="mobile-menu-cta" onClick={() => setOpen(false)}>
					Request a quote
				</Link>
			</div>
		</>
	);
}
