import type { Metadata } from "next";
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

export default function AdminLoginPage() {
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
				<LoginForm />
			</div>
		</div>
	);
}
