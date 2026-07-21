import type { Metadata } from "next";
import Corners from "@/components/corners";
import ImageSlot from "@/components/image-slot";
import QuoteCta from "@/components/quote-cta";
import ScrollReveal from "@/components/scroll-reveal";
import { getFaqs } from "@/lib/content";
import { bodyCopy, kicker, kickerRule, pageGutter, sectionTitle } from "@/lib/style-tokens";

export const metadata: Metadata = {
	title: "Compliance & Safety — Pacific Hoardings",
	description: "AS 4687 certification, council permits, SafeWork NSW compliance and $20M public liability — what's behind every hoarding we put up.",
};

const asSpecs = [
	{ label: "Drawings", detail: "General arrangement drawings for the specific site and hoarding type" },
	{ label: "Load cases", detail: "Wind, live and dead loads calculated for the site's actual conditions" },
	{ label: "Tie-downs", detail: "Footing and tie-down details engineered to the ground conditions on site" },
	{ label: "Sign-off", detail: "Signed and stamped by our structural engineer before the permit is lodged" },
];

const handoverSpecs = [
	{ label: "Engineering drawings", detail: "Signed general arrangement and load case drawings" },
	{ label: "Permit approvals", detail: "Copies of the hoarding, footpath and traffic control approvals" },
	{ label: "Insurance certificate", detail: "Certificate of currency for our $20M public liability cover" },
	{ label: "Compliance sign-off", detail: "Written confirmation the install matches the certified drawings" },
];

export default async function CompliancePage() {
	const faqs = await getFaqs();
	const complianceFaqs = faqs.filter((f) => f.id === "council-approval" || f.id === "certification");

	return (
		<>
			<ScrollReveal />

			<div style={{ maxWidth: 1240, margin: "0 auto", padding: `0 ${pageGutter}` }}>
				<section style={{ padding: "56px 0 48px" }}>
					<span style={kicker}>Compliance</span>
					<hr style={kickerRule} />
					<h1 className="ph-reveal" style={{ ...sectionTitle, fontSize: "clamp(36px, 4.4vw, 60px)", margin: "0 0 16px" }}>
						Compliant is the minimum
					</h1>
					<p
						className="ph-reveal"
						style={{ fontSize: 18, lineHeight: "28px", maxWidth: "56ch", margin: 0, color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}
					>
						Every hoarding we put up is designed, certified and permitted before the first panel goes up. This is what that
						actually means — the standard we build to, the approvals council asks for, and what lands in your inbox when the
						job&rsquo;s done.
					</p>
				</section>

				<section style={{ padding: "24px 0 64px" }}>
					<span style={kicker}>AS 4687 certification</span>
					<hr style={kickerRule} />
					<p className="ph-reveal" style={{ ...bodyCopy, maxWidth: "64ch", marginBottom: 32 }}>
						AS 4687 is the Australian Standard for temporary fencing and hoardings — it sets the engineering benchmark every
						hoarding on public land has to clear. We don&rsquo;t treat it as a box to tick after the fact: every job is
						designed to the standard from the first drawing, not retrofitted with paperwork once it&rsquo;s already standing.
					</p>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "clamp(20px, 3vw, 32px)" }}>
						{asSpecs.map((spec) => (
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
							Any hoarding standing on or over public land — a footpath, road reserve or laneway — needs council approval
							before it goes up. Three approvals usually travel together: the hoarding permit itself, footpath occupation
							where the hoarding or gantry extends over council land, and a traffic control plan wherever pedestrians or
							vehicles need to be managed around it. We prepare and lodge all three, and stay the point of contact if council
							comes back with questions.
						</p>
					</div>
					<figure className="blueprint ph-reveal duotone" style={{ margin: 0 }}>
						<ImageSlot placeholder="Drop a photo — hoarding permit signage on site" label="Approved hoarding permit signage on site" />
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
							Every install runs under a Safe Work Method Statement to SafeWork NSW&rsquo;s requirements, and every installer
							on our crew holds the licence the job calls for — high-risk construction work licensing included. That&rsquo;s
							not a certificate kept in a drawer; it&rsquo;s what the crew is actually working to on site.
						</p>
						<span style={{ ...kicker, marginTop: 28 }}>Insurance</span>
						<hr style={kickerRule} />
						<p className="ph-reveal" style={{ ...bodyCopy, maxWidth: "48ch" }}>
							We carry $20M public liability cover on every job, and can supply a certificate of currency before you need
							one — for your principal contractor agreement, your PC&rsquo;s file, or your own insurer.
						</p>
					</div>
					<figure className="blueprint ph-reveal duotone" style={{ margin: 0 }}>
						<ImageSlot placeholder="Drop a photo — crew on site in PPE" label="Pacific Hoardings crew on site in full PPE" />
						<Corners />
					</figure>
				</section>

				<section style={{ padding: "24px 0 64px" }}>
					<span style={kicker}>What you get</span>
					<hr style={kickerRule} />
					<p className="ph-reveal" style={{ ...bodyCopy, maxWidth: "64ch", marginBottom: 32 }}>
						Every job hands back the same paper trail — nothing you have to chase after the crew&rsquo;s left site.
					</p>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "clamp(20px, 3vw, 32px)" }}>
						{handoverSpecs.map((spec) => (
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
						<span className="tag tag-accent">AS 4687 certified</span>
						<span className="tag tag-outline">SafeWork NSW compliant</span>
						<span className="tag tag-outline">$20M public liability</span>
						<span className="tag tag-outline">Licensed installers</span>
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
