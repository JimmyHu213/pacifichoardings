import type { Metadata } from "next";
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "@/lib/admin-session";
import { logoutAction } from "../actions";
import { pageGutter } from "@/lib/style-tokens";

export const metadata: Metadata = {
	title: "Pacific Hoardings — Admin",
	robots: { index: false, follow: false },
};

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
	const cookieStore = await cookies();
	const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

	const { env } = await getCloudflareContext({ async: true });
	const isAuthed = env.SESSION_SECRET ? await verifySessionCookieValue(sessionCookie, env.SESSION_SECRET) : false;

	if (!isAuthed) {
		redirect("/admin/login");
	}

	return (
		<div style={{ minHeight: "100svh", display: "flex", flexDirection: "column" }}>
			<header
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					gap: 16,
					padding: `16px ${pageGutter}`,
					borderBottom: "1px solid var(--color-divider)",
				}}
			>
				<span
					style={{
						fontFamily: "var(--font-heading)",
						fontWeight: 600,
						fontSize: 16,
						textTransform: "uppercase",
						letterSpacing: "0.04em",
					}}
				>
					Pacific Hoardings — Admin
				</span>
				<nav style={{ display: "flex", gap: 20, marginRight: "auto", marginLeft: 24, fontSize: 14 }}>
					<Link href="/admin" style={{ color: "inherit", textDecoration: "none" }}>
						Dashboard
					</Link>
					<Link href="/admin/quotes" style={{ color: "inherit", textDecoration: "none" }}>
						Quotes
					</Link>
					<Link href="/admin/projects" style={{ color: "inherit", textDecoration: "none" }}>
						Projects
					</Link>
					<Link href="/admin/faqs" style={{ color: "inherit", textDecoration: "none" }}>
						FAQs
					</Link>
				</nav>
				<form action={logoutAction}>
					<button type="submit" className="btn btn-secondary" style={{ fontSize: 13 }}>
						Log out
					</button>
				</form>
			</header>
			<main style={{ flex: 1 }}>{children}</main>
		</div>
	);
}
