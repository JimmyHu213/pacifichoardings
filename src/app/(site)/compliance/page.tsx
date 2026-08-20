import type { Metadata } from "next";
import Corners from "@/components/corners";
import ImageSlot from "@/components/image-slot";
import QuoteCta from "@/components/quote-cta";
import ScrollReveal from "@/components/scroll-reveal";
import { getComplianceContent, getComplianceTags, getFaqs } from "@/lib/content";
import { bodyCopy, kicker, kickerRule, pageGutter, sectionTitle } from "@/lib/style-tokens";

export const metadata: Metadata = {
	title: "Compliance & Safety — Pacific Hoardings",
	description: "Hoardings engineered to AS 4687 and AS/NZS 1170, council permits under the Roads Act, SafeWork NSW compliance and $20M public liability — what's behind every hoarding we put up.",
};

// getFaqs(), getComplianceContent(), and getComplianceTags() read D1 — see the
// note in (site)/page.tsx for why this has to be explicit.
export const dynamic = "force-dynamic";

export default async function CompliancePage() {
	const [faqs, content, tags] = await Promise.all([getFaqs(), getComplianceContent(), getComplianceTags()]);
	const complianceFaqs = faqs.filter((f) => f.id === "council-approval" || f.id === "certification");

	return (
		<>
			<ScrollReveal />

			<div className="ph-sheet" style={{ maxWidth: 1240, margin: "0 auto", padding: `0 ${pageGutter}` }}>
				<section style={{ padding: "56px 0 48px" }}>
					<span style={kicker}>Compliance</span>
					<hr style={kickerRule} />
					<h1 className="ph-reveal" style={{ ...sectionTitle, fontSize: "clamp(36px, 4.4vw, 60px)", margin: "0 0 16px" }}>
						{content.headline}
					</h1>
					<p
						className="ph-reveal"
						style={{ fontSize: 18, lineHeight: "28px", maxWidth: "56ch", margin: 0, color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}
					>
						{content.intro}
					</p>
				</section>

				<section style={{ padding: "24px 0 64px" }}>
					<span style={kicker}>Engineered to standard</span>
					<hr style={kickerRule} />
					<p className="ph-reveal" style={{ ...bodyCopy, maxWidth: "64ch", marginBottom: 32 }}>
						{content.standardsBody}
					</p>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "clamp(20px, 3vw, 32px)" }}>
						{content.standardsCards.map((spec) => (
							<div key={spec.label} className="blueprint ph-reveal ph-svc" style={{ padding: 20 }}>
								<Corners />
								<strong
									style={{
										display: "block",
										fontSize: 13,
										letterSpacing: "0.08em",
										textTransform: "uppercase",
										color: "var(--color-accent-700)",
										marginBottom: 8,
									}}
								>
									{spec.label}
								</strong>
								<p style={{ ...bodyCopy, margin: 0 }}>{spec.detail}</p>
							</div>
						))}
					</div>
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
						<span style={kicker}>Council permits & traffic control</span>
						<hr style={kickerRule} />
						<p className="ph-reveal" style={{ ...bodyCopy, maxWidth: "48ch" }}>
							{content.permitsBody}
						</p>
					</div>
					<figure className="blueprint ph-reveal duotone" style={{ margin: 0 }}>
						{content.permitImageKey ? (
							// eslint-disable-next-line @next/next/no-img-element -- R2 photos are served unoptimised by design (see /media route)
							<img
								src={`/media/${content.permitImageKey}`}
								alt={content.permitImageAlt}
								style={{ display: "block", width: "100%", height: "auto" }}
							/>
						) : (
							<ImageSlot placeholder="Drop a photo — hoarding permit signage on site" label={content.permitImageAlt} />
						)}
						<Corners />
					</figure>
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
						<span style={kicker}>SafeWork NSW</span>
						<hr style={kickerRule} />
						<p className="ph-reveal" style={{ ...bodyCopy, maxWidth: "48ch" }}>
							{content.safeworkBody}
						</p>
						<span style={{ ...kicker, marginTop: 28 }}>Insurance</span>
						<hr style={kickerRule} />
						<p className="ph-reveal" style={{ ...bodyCopy, maxWidth: "48ch" }}>
							{content.insuranceBody}
						</p>
					</div>
					<figure className="blueprint ph-reveal duotone" style={{ margin: 0 }}>
						{content.crewImageKey ? (
							// eslint-disable-next-line @next/next/no-img-element -- R2 photos are served unoptimised by design (see /media route)
							<img
								src={`/media/${content.crewImageKey}`}
								alt={content.crewImageAlt}
								style={{ display: "block", width: "100%", height: "auto" }}
							/>
						) : (
							<ImageSlot placeholder="Drop a photo — crew on site in PPE" label={content.crewImageAlt} />
						)}
						<Corners />
					</figure>
				</section>

				<section style={{ padding: "24px 0 64px" }}>
					<span style={kicker}>What you get</span>
					<hr style={kickerRule} />
					<p className="ph-reveal" style={{ ...bodyCopy, maxWidth: "64ch", marginBottom: 32 }}>
						{content.handoverBody}
					</p>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "clamp(20px, 3vw, 32px)" }}>
						{content.handoverCards.map((spec) => (
							<div key={spec.label} className="blueprint ph-reveal ph-svc" style={{ padding: 20 }}>
								<Corners />
								<strong
									style={{
										display: "block",
										fontSize: 13,
										letterSpacing: "0.08em",
										textTransform: "uppercase",
										color: "var(--color-accent-700)",
										marginBottom: 8,
									}}
								>
									{spec.label}
								</strong>
								<p style={{ ...bodyCopy, margin: 0 }}>{spec.detail}</p>
							</div>
						))}
					</div>
				</section>

				<section style={{ padding: "24px 0 64px" }}>
					<span style={kicker}>Compliance</span>
					<hr style={kickerRule} />
					<div className="ph-reveal" style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
						{tags.map((tag) => (
							<span key={tag.id} className={tag.accent ? "tag tag-accent" : "tag tag-outline"}>
								{tag.label}
							</span>
						))}
					</div>
				</section>

				{complianceFaqs.length > 0 && (
					<section style={{ padding: "24px 0 64px" }}>
						<span style={kicker}>Questions we get on this</span>
						<hr style={kickerRule} />
						<div style={{ maxWidth: "76ch" }}>
							{complianceFaqs.map((f, i) => (
								<details
									key={f.id}
									className="ph-reveal"
									style={{ borderBottom: i === complianceFaqs.length - 1 ? undefined : "1px solid var(--color-divider)", padding: "16px 0" }}
								>
									<summary
										style={{
											cursor: "pointer",
											fontFamily: "var(--font-heading)",
											fontWeight: 600,
											fontSize: 18,
											lineHeight: "24px",
											letterSpacing: "0.02em",
											textTransform: "uppercase",
										}}
									>
										{f.q}
									</summary>
									<p style={{ ...bodyCopy, margin: "12px 0 0" }}>{f.a}</p>
								</details>
							))}
						</div>
					</section>
				)}
			</div>

			<QuoteCta heading="Get your hoarding certified" />
		</>
	);
}
