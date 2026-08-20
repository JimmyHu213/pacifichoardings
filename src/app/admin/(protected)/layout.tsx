import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "@/lib/admin-session";
import { logoutAction } from "../actions";
import AdminNav, { type AdminNavGroup } from "./admin-nav";

export const metadata: Metadata = {
	title: "Pacific Hoardings — Admin",
	robots: { index: false, follow: false },
};

// The nav model lives here (server side) so future CMS sections are added in
// one place; AdminNav only renders it.
const NAV_GROUPS: AdminNavGroup[] = [
	{ label: null, items: [{ href: "/admin", label: "Dashboard" }] },
	{ label: "Inbox", items: [{ href: "/admin/quotes", label: "Quotes" }] },
	{
		label: "Content",
		items: [
			{ href: "/admin/projects", label: "Projects" },
			{ href: "/admin/faqs", label: "FAQs" },
			{ href: "/admin/company", label: "Company info" },
			{ href: "/admin/about", label: "About page" },
			{ href: "/admin/services", label: "Services" },
			{ href: "/admin/stats", label: "Stats" },
			{ href: "/admin/testimonials", label: "Testimonials" },
			{ href: "/admin/clients", label: "Clients" },
			{ href: "/admin/compliance-tags", label: "Compliance tags" },
		],
	},
];

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
	const cookieStore = await cookies();
	const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

	const { env } = await getCloudflareContext({ async: true });
	const isAuthed = env.SESSION_SECRET ? await verifySessionCookieValue(sessionCookie, env.SESSION_SECRET) : false;

	if (!isAuthed) {
		redirect("/admin/login");
	}

	return (
		<div className="admin-shell">
			<AdminNav groups={NAV_GROUPS}>
				<a className="admin-nav-link" href="/" target="_blank" rel="noopener">
					View site ↗
				</a>
				<form action={logoutAction}>
					<button type="submit" className="btn btn-secondary" style={{ width: "100%", fontSize: 13 }}>
						Log out
					</button>
				</form>
			</AdminNav>
			<main className="admin-main">{children}</main>
		</div>
	);
}
