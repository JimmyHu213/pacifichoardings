import type { Metadata } from "next";
import Corners from "@/components/corners";
import ImageSlot from "@/components/image-slot";
import QuoteCta from "@/components/quote-cta";
import ScrollReveal from "@/components/scroll-reveal";
import { getClients, getStats } from "@/lib/content";
import { bodyCopy, kicker, kickerRule, pageGutter, sectionTitle } from "@/lib/style-tokens";

export const metadata: Metadata = {
	title: "About — Pacific Hoardings",
	description: "One crew, one engineer, every hoarding — who we are and how Pacific Hoardings runs a job from quote to dismantle.",
};

export default async function AboutPage() {
	const [stats, clients] = await Promise.all([getStats(), getClients()]);

	return (
		<>
			<ScrollReveal />

			<div className="ph-sheet" style={{ maxWidth: 1240, margin: "0 auto", padding: `0 ${pageGutter}` }}>
				<section style={{ padding: "56px 0 48px" }}>
					<span style={kicker}>About</span>
					<hr style={kickerRule} />
					<h1 className="ph-reveal" style={{ ...sectionTitle, fontSize: "clamp(36px, 4.4vw, 60px)", margin: "0 0 16px" }}>
						One crew. One engineer. Every hoarding.
					</h1>
					<p
						className="ph-reveal"
						style={{ fontSize: 18, lineHeight: "28px", maxWidth: "56ch", margin: 0, color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}
					>
						Pacific Hoardings designs, certifies and installs site hoardings for builders, developers and government across
						NSW — the same crew and the same engineer from the first site walk to the day it comes down.
					</p>
				</section>

				<section
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
						gap: "24px clamp(24px, 5vw, 96px)",
						alignItems: "center",
						padding: "24px 0 64px",
					}}
				>
					<div>
						<span style={kicker}>Who we are</span>
						<hr style={kickerRule} />
						<p className="ph-reveal" style={{ ...bodyCopy, maxWidth: "48ch" }}>
							We started as a hoarding installer and became the crew builders call when the paperwork matters as much as the
							panels. Every job still runs the same way — one crew stands it, one engineer signs it, and the same point of
							contact answers the phone from quote to dismantle.
						</p>
						<span style={{ ...kicker, marginTop: 28 }}>Compliant is the minimum</span>
						<hr style={kickerRule} />
						<p className="ph-reveal" style={{ ...bodyCopy, maxWidth: "48ch" }}>
							Anyone can stand a fence. We design and certify every hoarding to AS 4687, walk it past council before the first
							panel goes up, and keep it standing through the wind study, the inspection and eighteen months of the public
							leaning on it. Compliant is the floor we build from, not the ceiling we aim for.
						</p>
					</div>
					<figure className="blueprint ph-reveal duotone" style={{ margin: 0 }}>
						<ImageSlot placeholder="Drop a photo — the crew on site" label="Pacific Hoardings crew on site" />
						<Corners />
					</figure>
				</section>

				<section aria-label="Pacific Hoardings — track record" style={{ padding: "24px 0 64px" }}>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
							gap: "48px clamp(32px, 6vw, 120px)",
							alignItems: "start",
						}}
					>
						<div className="ph-reveal" style={{ position: "sticky", top: 96 }}>
							<span style={kicker}>Track record</span>
							<hr style={kickerRule} />
							<h2 style={{ ...sectionTitle, fontSize: "clamp(28px, 3vw, 38px)" }}>What we&rsquo;re held to</h2>
							<p style={{ ...bodyCopy, margin: "20px 0 0", maxWidth: "42ch" }}>
								The same numbers we quote on every job, not a highlight reel — values hold for metropolitan NSW, with
								regional and interstate programs quoted to schedule.
							</p>
						</div>
						<div>
							{stats.map((s, i) => (
								<div
									key={s.label}
									className="ph-reveal"
									style={{
										display: "flex",
										alignItems: "baseline",
										justifyContent: "space-between",
										gap: 24,
										flexWrap: "wrap",
										padding: "28px 0",
										borderTop: `1px solid ${i === 0 ? "var(--color-text)" : "var(--color-divider)"}`,
										borderBottom: i === stats.length - 1 ? "1px solid var(--color-text)" : undefined,
									}}
								>
									<span
										style={{
											fontFamily: "var(--font-heading)",
											fontWeight: 600,
											fontSize: "clamp(56px, 6vw, 96px)",
											lineHeight: 0.9,
											letterSpacing: "0.01em",
											whiteSpace: "nowrap",
											fontFeatureSettings: "'tnum' 1",
											color: s.accent ? "var(--color-accent-700)" : undefined,
										}}
									>
										{s.value}
									</span>
									<span
										style={{
											fontSize: 14,
											lineHeight: "20px",
											maxWidth: "24ch",
											textAlign: "right",
											color: "color-mix(in srgb, var(--color-text) 70%, transparent)",
										}}
									>
										<strong
											style={{
												display: "block",
												color: "var(--color-text)",
												fontWeight: 600,
												letterSpacing: "0.08em",
												textTransform: "uppercase",
												fontSize: 13,
											}}
										>
											{s.label}
										</strong>
										{s.detail}
									</span>
								</div>
							))}
						</div>
					</div>
				</section>

				<section style={{ padding: "24px 0 64px" }}>
					<span style={kicker}>The yard</span>
					<hr style={kickerRule} />
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
							gap: "24px clamp(24px, 5vw, 96px)",
							alignItems: "center",
						}}
					>
						<figure className="blueprint ph-reveal duotone" style={{ margin: 0 }}>
							<ImageSlot placeholder="Drop a photo — the yard, Wetherill Park" label="Pacific Hoardings yard, Wetherill Park" />
							<Corners />
						</figure>
						<p className="ph-reveal" style={{ ...bodyCopy, maxWidth: "48ch" }}>
							Every panel, gantry and fence line goes out of the same Wetherill Park yard, measured and staged against the
							site plan before the truck leaves. It&rsquo;s also where the wrap gets printed and the paperwork gets filed —
							one address for the whole job.
						</p>
					</div>
				</section>

				<section style={{ padding: "24px 0 64px" }}>
					<span style={kicker}>Who we work with</span>
					<hr style={kickerRule} />
					<div className="ph-reveal" style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
						{clients.map((name) => (
							<span key={name} className="tag tag-outline">
								{name}
							</span>
						))}
					</div>
				</section>

				<section style={{ padding: "24px 0 64px" }}>
					<span style={kicker}>Compliance</span>
					<hr style={kickerRule} />
					<div className="ph-reveal" style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
						<span className="tag tag-accent">AS 4687 certified</span>
						<span className="tag tag-outline">SafeWork NSW compliant</span>
						<span className="tag tag-outline">$20M public liability</span>
						<span className="tag tag-outline">Licensed installers</span>
					</div>
				</section>
			</div>

			<QuoteCta heading="Get your job priced" />
		</>
	);
}
