"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export interface AdminNavGroup {
	label: string | null;
	items: { href: string; label: string }[];
}

// Sidebar on desktop; under 900px (theme.css .admin-* rules) a compact top
// bar with the shared hamburger toggles the same nav as an overlay drawer.
// `children` is the server-rendered footer (View site + logout form), passed
// through so this client component never imports server actions.
export default function AdminNav({ groups, children }: { groups: AdminNavGroup[]; children: ReactNode }) {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	// Close on route change — state adjustment during render, not in an
	// effect, matching mobile-menu.tsx.
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

	// /admin is the dashboard and must not light up for every subpage;
	// section links match themselves and any subpath (e.g. /admin/projects/3).
	const isActive = (href: string) =>
		href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);

	return (
		<>
			<header className="admin-topbar">
				<span className="admin-brand">Pacific Hoardings — Admin</span>
				<button
					type="button"
					className="nav-hamburger"
					aria-expanded={open}
					aria-controls="admin-sidebar"
					aria-label={open ? "Close menu" : "Menu"}
					onClick={() => setOpen((v) => !v)}
				>
					<span className={`nav-hamburger-icon${open ? " is-open" : ""}`} aria-hidden="true">
						<span></span>
						<span></span>
						<span></span>
					</span>
				</button>
			</header>
			{open && <div className="admin-scrim" onClick={() => setOpen(false)} />}
			<aside id="admin-sidebar" className={`admin-sidebar${open ? " is-open" : ""}`}>
				<span className="admin-brand">Pacific Hoardings — Admin</span>
				<nav style={{ display: "grid", gap: 20 }}>
					{groups.map((group, i) => (
						<div key={group.label ?? i}>
							{group.label && <span className="admin-nav-group">{group.label}</span>}
							{group.items.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className={`admin-nav-link${isActive(item.href) ? " is-active" : ""}`}
									onClick={() => setOpen(false)}
								>
									{item.label}
								</Link>
							))}
						</div>
					))}
				</nav>
				<div className="admin-sidebar-footer">{children}</div>
			</aside>
		</>
	);
}
