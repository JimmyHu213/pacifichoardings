import type { Metadata } from "next";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import LoginForm from "./login-form";
import { kicker, kickerRule, pageGutter } from "@/lib/style-tokens";

export const metadata: Metadata = {
	title: "Admin login — Pacific Hoardings",
	robots: { index: false, follow: false },
};

// No per-request data of its own, but kept dynamic so every /admin/** route
// is consistently server-rendered rather than relying on one page happening
// to stay static as the login flow evolves.
export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
	// Public Turnstile site key, read from the Worker env so it can differ
	// between environments (test key locally, real widget in production)
	// without a rebuild. Passed to the client form as a prop rather than a
	// NEXT_PUBLIC_ build-time constant.
	const { env } = await getCloudflareContext({ async: true });
	const siteKey = env.TURNSTILE_SITE_KEY ?? "";

	return (
		<div style={{ minHeight: "100svh", display: "flex", alignItems: "center", justifyContent: "center", padding: pageGutter }}>
			<div style={{ width: "100%", maxWidth: 360 }}>
				<span style={kicker}>Admin</span>
				<hr style={kickerRule} />
				<h1
					style={{
						fontFamily: "var(--font-heading)",
						fontWeight: 600,
						fontSize: 28,
						textTransform: "uppercase",
						letterSpacing: "0.02em",
						margin: "0 0 20px",
					}}
				>
					Pacific Hoardings
				</h1>
				<LoginForm siteKey={siteKey} />
			</div>
		</div>
	);
}
