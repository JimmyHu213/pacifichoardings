import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Corners from "@/components/corners";
import ImageSlot from "@/components/image-slot";
import QuoteCta from "@/components/quote-cta";
import ScrollReveal from "@/components/scroll-reveal";
import { getFaqs, getServices } from "@/lib/content";
import { bodyCopy, kicker, kickerRule, pageGutter, sectionTitle } from "@/lib/style-tokens";

// getFaqs() reads D1 for this page's FAQ subset, so the whole page has to be
// dynamic (see the note in (site)/page.tsx) — that makes generateStaticParams
// a no-op, so it's gone rather than left in as dead/misleading config; unknown
// slugs still 404 via notFound() below, same as before.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params;
	const services = await getServices();
	const service = services.find((s) => s.slug === slug);
	if (!service) return {};
	return {
		title: `${service.title} — Pacific Hoardings`,
		description: service.tagline,
	};
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const [services, faqs] = await Promise.all([getServices(), getFaqs()]);
	const service = services.find((s) => s.slug === slug);

	if (!service) {
		notFound();
	}

	const related = services.filter((s) => s.slug !== service.slug);
	const serviceFaqs = faqs.filter((f) => service.faqIds.includes(f.id));

	return (
		<>
			<ScrollReveal />

			<div className="ph-sheet" style={{ maxWidth: 1240, margin: "0 auto", padding: `0 ${pageGutter}` }}>
				<section style={{ padding: "56px 0 48px" }}>
					<nav
						aria-label="Breadcrumb"
						style={{
							fontSize: 12,
							letterSpacing: "0.08em",
							textTransform: "uppercase",
							color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
							marginBottom: 20,
						}}
					>
						<Link href="/" style={{ color: "inherit" }}>
							Home
						</Link>
						<span aria-hidden="true"> / </span>
						<span>Services</span>
						<span aria-hidden="true"> / </span>
						<span style={{ color: "var(--color-text)" }}>{service.title}</span>
					</nav>
					<span style={kicker}>Services</span>
					<hr style={kickerRule} />
					<h1 className="ph-reveal" style={{ ...sectionTitle, fontSize: "clamp(36px, 4.4vw, 60px)", margin: "0 0 16px" }}>
						{service.title}
					</h1>
					<p
						className="ph-reveal"
						style={{ fontSize: 18, lineHeight: "28px", maxWidth: "56ch", margin: 0, color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}
					>
						{service.tagline}
					</p>
					<div className="ph-reveal" style={{ marginTop: 28 }}>
						<Link href="/#quote" className="btn btn-primary" style={{ minHeight: 44, paddingInline: 22, fontSize: 15 }}>
							Get this priced
						</Link>
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
					<figure className="blueprint ph-reveal duotone" style={{ margin: 0 }}>
						<ImageSlot placeholder={service.images[0].placeholder} label={service.images[0].label} />
						<Corners />
					</figure>
					<div>
						<span style={kicker}>What it is</span>
						<hr style={kickerRule} />
						<p className="ph-reveal" style={{ ...bodyCopy, maxWidth: "48ch" }}>
							{service.overview}
						</p>
						<span style={{ ...kicker, marginTop: 28 }}>When you need it</span>
						<hr style={kickerRule} />
						<p className="ph-reveal" style={{ ...bodyCopy, maxWidth: "48ch" }}>
							{service.whenYouNeedIt}
						</p>
					</div>
				</section>

				<section style={{ padding: "24px 0 64px" }}>
					<span style={kicker}>Specs</span>
					<hr style={kickerRule} />
					<h2 className="ph-reveal" style={{ ...sectionTitle, fontSize: "clamp(28px, 3vw, 38px)", margin: "0 0 32px" }}>
						What&rsquo;s included
					</h2>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "clamp(20px, 3vw, 32px)" }}>
						{service.specs.map((spec) => (
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
					<span style={kicker}>Process</span>
					<hr style={kickerRule} />
					<h2 className="ph-reveal" style={{ ...sectionTitle, fontSize: "clamp(28px, 3vw, 38px)", margin: "0 0 32px" }}>
						How it runs
					</h2>
					<div>
						{service.process.map((step, i) => (
							<div
								key={step.step}
								className="ph-reveal"
								style={{
									display: "flex",
									gap: 24,
									padding: "20px 0",
									borderTop: `1px solid ${i === 0 ? "var(--color-text)" : "var(--color-divider)"}`,
									borderBottom: i === service.process.length - 1 ? "1px solid var(--color-text)" : undefined,
								}}
							>
								<span
									style={{
										fontFamily: "var(--font-heading)",
										fontWeight: 600,
										fontSize: 32,
										lineHeight: 1,
										color: "var(--color-accent-300)",
										fontFeatureSettings: "'tnum' 1",
										flex: "none",
										width: 48,
									}}
								>
									{String(i + 1).padStart(2, "0")}
								</span>
								<div>
									<strong style={{ display: "block", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 15, marginBottom: 4 }}>
										{step.step}
									</strong>
									<p style={{ ...bodyCopy, margin: 0 }}>{step.detail}</p>
								</div>
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
					<figure className="blueprint ph-reveal duotone" style={{ margin: 0 }}>
						<ImageSlot placeholder={service.images[1].placeholder} label={service.images[1].label} />
						<Corners />
					</figure>
					<div>
						<span style={kicker}>Compliance</span>
						<hr style={kickerRule} />
						<div className="ph-reveal" style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
							{service.complianceTags.map((tag, i) => (
								<span key={tag} className={i === 0 ? "tag tag-accent" : "tag tag-outline"}>
									{tag}
								</span>
							))}
						</div>
					</div>
				</section>

				<section style={{ padding: "24px 0 64px" }}>
					<span style={kicker}>Related services</span>
					<hr style={kickerRule} />
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "clamp(20px, 3vw, 32px)" }}>
						{related.map((r) => (
							<Link
								key={r.slug}
								href={`/services/${r.slug}`}
								className="blueprint ph-reveal ph-svc"
								style={{ padding: 20, display: "block", color: "inherit", textDecoration: "none" }}
							>
								<Corners />
								<strong style={{ display: "block", fontSize: 16, textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: 8 }}>
									{r.title}
								</strong>
								<p style={{ ...bodyCopy, margin: 0, fontSize: 13 }}>{r.body}</p>
							</Link>
						))}
					</div>
				</section>

				{serviceFaqs.length > 0 && (
					<section style={{ padding: "24px 0 64px" }}>
						<span style={kicker}>Questions on this one</span>
						<hr style={kickerRule} />
						<div style={{ maxWidth: "76ch" }}>
							{serviceFaqs.map((f, i) => (
								<details
									key={f.id}
									className="ph-reveal"
									style={{ borderBottom: i === serviceFaqs.length - 1 ? undefined : "1px solid var(--color-divider)", padding: "16px 0" }}
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

			<QuoteCta heading={`Get ${service.title.toLowerCase()} priced`} />
		</>
	);
}
