import { getAboutContent } from "@/lib/content";
import { kicker, kickerRule, pageGutter } from "@/lib/style-tokens";
import AboutForm from "./about-form";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
	const about = await getAboutContent();

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter}` }}>
			<span style={kicker}>About page</span>
			<hr style={kickerRule} />
			<p style={{ fontSize: 14, lineHeight: "22px", maxWidth: "60ch", margin: "0 0 24px", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
				This is the /about page&rsquo;s content. Photos replace the placeholder frames as soon as they&rsquo;re uploaded.
			</p>
			<AboutForm initial={about} />
		</div>
	);
}
