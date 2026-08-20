import Image from "next/image";
import QuoteForm from "./quote-form";
import Corners from "@/components/corners";
import ImageSlot from "@/components/image-slot";
import ProjectImage from "@/components/project-image";
import ScrollReveal from "@/components/scroll-reveal";
import SiteFooter from "@/components/site-footer";
import { bodyCopy, kicker, kickerRule, pageGutter, sectionTitle } from "@/lib/style-tokens";
import { getClients, getCompanyInfo, getFaqs, getProjects, getServices, getStats, getTestimonials } from "@/lib/content";
import type { Project } from "@/lib/content";

// getProjects()/getFaqs() read D1 — a plain data read isn't a signal Next's
// static analysis reacts to (unlike cookies()/headers()), so without this the
// page would prerender once at build time and never see new content again.
export const dynamic = "force-dynamic";

const rise = (delay: string) => `ph-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay} both`;

function ClientMarquee({ clients, hidden }: { clients: string[]; hidden?: boolean }) {
	return (
		<div
			aria-hidden={hidden || undefined}
			style={{
				display: "flex",
				flex: "none",
				alignItems: "center",
				gap: 56,
				paddingRight: 56,
				animation: "ph-marquee 32s linear infinite",
				fontFamily: "var(--font-heading)",
				fontWeight: 600,
				fontSize: 22,
				letterSpacing: "0.06em",
				textTransform: "uppercase",
				whiteSpace: "nowrap",
				color: "color-mix(in srgb, var(--color-bg) 75%, transparent)",
			}}
		>
			{clients.map((name) => (
				<span key={name} style={{ display: "contents" }}>
					<span>{name}</span>
					<span aria-hidden="true" style={{ color: "var(--color-accent-300)", fontWeight: 400 }}>
						+
					</span>
				</span>
			))}
		</div>
	);
}

function ProjectRail({ projects, hidden }: { projects: Project[]; hidden?: boolean }) {
	return (
		<div
			aria-hidden={hidden || undefined}
			style={{
				display: "flex",
				flex: "none",
				gap: "clamp(24px, 3vw, 48px)",
				paddingRight: "clamp(24px, 3vw, 48px)",
				animation: "ph-marquee 48s linear infinite",
				alignItems: "start",
			}}
		>
			{projects.map((p) => (
				<figure key={p.id} style={{ margin: 0, flex: "none", width: "clamp(300px, 32vw, 440px)" }}>
					<div className="blueprint duotone">
						{p.image.key ? (
							<ProjectImage image={hidden ? { ...p.image, label: "" } : p.image} variant="rail" />
						) : (
							<ImageSlot placeholder="Drop a project photo" label={hidden ? undefined : "Project photograph"} />
						)}
						<Corners />
					</div>
					<figcaption
						style={{ fontSize: 13, lineHeight: "24px", marginTop: 12, color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}
					>
						<strong style={{ color: "var(--color-text)", fontWeight: 600 }}>{p.title}</strong> — {p.detail}
					</figcaption>
				</figure>
			))}
		</div>
	);
}

export default async function Home() {
	const [clients, stats, services, projects, testimonials, faqs, company] = await Promise.all([
		getClients(),
		getStats(),
		getServices(),
		getProjects(),
		getTestimonials(),
		getFaqs(),
		getCompanyInfo(),
	]);

	return (
		<>
			<ScrollReveal />

			<section
				style={{
					position: "relative",
					minHeight: "100svh",
					display: "flex",
					flexDirection: "column",
					background: "var(--color-accent-900)",
					color: "var(--color-bg)",
					overflow: "hidden",
				}}
			>
				<video
					src="/hero.mp4"
					autoPlay
					muted
					loop
					playsInline
					aria-hidden="true"
					style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.5 }}
				></video>
				<div
					aria-hidden="true"
					style={{
						position: "absolute",
						inset: -80,
						backgroundImage:
							"linear-gradient(color-mix(in srgb, var(--color-bg) 6%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--color-bg) 6%, transparent) 1px, transparent 1px)",
						backgroundSize: "72px 72px",
						animation: "ph-grid-drift 24s linear infinite",
					}}
				></div>
				<div
					aria-hidden="true"
					style={{
						position: "absolute",
						inset: 0,
						background:
							"linear-gradient(180deg, color-mix(in srgb, var(--color-accent-900) 45%, transparent) 0%, color-mix(in srgb, var(--color-accent-900) 20%, transparent) 45%, color-mix(in srgb, var(--color-accent-900) 78%, transparent) 100%)",
					}}
				></div>
				<div
					style={{
						position: "relative",
						flex: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						width: "100%",
						maxWidth: 1240,
						margin: "0 auto",
						padding: `140px ${pageGutter} 0`,
						textAlign: "center",
					}}
				>
					<h1
						style={{
							fontFamily: "var(--font-heading)",
							fontWeight: 600,
							fontSize: "clamp(44px, 5.5vw, 78px)",
							lineHeight: 1.04,
							letterSpacing: "0.01em",
							textTransform: "uppercase",
							margin: 0,
							color: "var(--color-bg)",
							animation: rise("0.1s"),
						}}
					>
						<span style={{ display: "block" }}>Welcome to Australia&rsquo;s</span>
						<span style={{ display: "block", color: "var(--color-accent-300)" }}>top hoarding service</span>
					</h1>
					<span
						style={{
							display: "block",
							fontSize: 13,
							lineHeight: "12px",
							letterSpacing: "0.12em",
							textTransform: "uppercase",
							fontWeight: 600,
							color: "var(--color-accent-300)",
							margin: "28px 0 0",
							animation: rise("0.3s"),
						}}
					>
						Class A + B hoardings · Sydney &amp; the Central Coast
					</span>
				</div>
				<a
					href="#services"
					aria-label="Scroll down to services"
					style={{
						position: "relative",
						alignSelf: "center",
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						gap: 10,
						margin: "40px 0 28px",
						color: "color-mix(in srgb, var(--color-bg) 70%, transparent)",
						animation: rise("0.68s"),
					}}
				>
					<span style={{ fontSize: 11, lineHeight: "12px", letterSpacing: "0.28em", textTransform: "uppercase", fontWeight: 600 }}>
						Scroll
					</span>
					<span
						aria-hidden="true"
						style={{
							display: "block",
							width: 1,
							height: 44,
							overflow: "hidden",
							background: "color-mix(in srgb, var(--color-bg) 25%, transparent)",
						}}
					>
						<span className="ph-scroll-line" style={{ display: "block", width: "100%", height: "100%", background: "var(--color-accent-300)" }}></span>
					</span>
				</a>
				<div
					style={{
						position: "relative",
						borderTop: "1px solid color-mix(in srgb, var(--color-bg) 25%, transparent)",
						animation: "ph-rise 1s cubic-bezier(0.22, 1, 0.36, 1) 0.75s both",
					}}
				>
					<div
						style={{ maxWidth: 1240, margin: "0 auto", padding: `0 ${pageGutter}`, display: "flex", alignItems: "center", gap: 32 }}
					>
						<span
							style={{
								flex: "none",
								padding: "20px 0",
								fontSize: 13,
								lineHeight: "16px",
								letterSpacing: "0.12em",
								textTransform: "uppercase",
								fontWeight: 600,
								color: "var(--color-accent-300)",
								borderRight: "1px solid color-mix(in srgb, var(--color-bg) 25%, transparent)",
								paddingRight: 32,
							}}
						>
							On site with
						</span>
						<div
							style={{
								overflow: "hidden",
								flex: 1,
								display: "flex",
								maskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
							}}
						>
							<ClientMarquee clients={clients} />
							<ClientMarquee clients={clients} hidden />
						</div>
					</div>
				</div>
			</section>

			<div className="ph-sheet" style={{ maxWidth: 1240, margin: "0 auto", padding: `0 ${pageGutter}` }}>
				<section aria-label="Pacific Hoardings — capability data" style={{ padding: "88px 0 72px" }}>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
							gap: "48px clamp(32px, 6vw, 120px)",
							alignItems: "start",
						}}
					>
						<div className="ph-reveal" style={{ position: "sticky", top: 96 }}>
							<span style={kicker}>01 · Capability data</span>
							<hr style={kickerRule} />
							<h2
								style={{
									fontFamily: "var(--font-heading)",
									fontWeight: 600,
									fontSize: "clamp(36px, 3.6vw, 52px)",
									lineHeight: 1.05,
									letterSpacing: "0.02em",
									textTransform: "uppercase",
									margin: 0,
								}}
							>
								Pacific Hoardings
								<br />— capability data
							</h2>
							<p style={{ ...bodyCopy, margin: "20px 0 0", maxWidth: "42ch" }}>
								The numbers we&rsquo;re held to on every job across Sydney and the Central Coast.
							</p>
							<div
								style={{
									display: "flex",
									gap: 24,
									marginTop: 28,
									fontSize: 13,
									letterSpacing: "0.08em",
									textTransform: "uppercase",
									fontWeight: 600,
									color: "color-mix(in srgb, var(--color-text) 55%, transparent)",
								}}
							>
								<span>PH-100</span>
								<span aria-hidden="true" style={{ color: "var(--color-accent-300)" }}>
									+
								</span>
								<span>Rev A</span>
								<span aria-hidden="true" style={{ color: "var(--color-accent-300)" }}>
									+
								</span>
								<span>Sheet 01</span>
								<span aria-hidden="true" style={{ color: "var(--color-accent-300)" }}>
									+
								</span>
								<span>Structural Hoardings</span>
							</div>
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
											fontSize: "clamp(72px, 8vw, 132px)",
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

				<section id="services" style={{ padding: "60px 0 60px" }}>
					<span style={kicker}>02 · Services</span>
					<hr style={kickerRule} />
					<h2 className="ph-reveal" style={{ ...sectionTitle, margin: "0 0 40px" }}>
						What we put up
					</h2>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "clamp(24px, 3vw, 48px)" }}>
						{services.map((svc, i) => (
							<div
								key={svc.title}
								className="blueprint ph-reveal ph-svc"
								style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12 }}
							>
								<Corners />
								<span
									style={{
										fontFamily: "var(--font-heading)",
										fontWeight: 600,
										fontSize: 32,
										lineHeight: 1,
										color: "var(--color-accent-300)",
										fontFeatureSettings: "'tnum' 1",
									}}
								>
									{String(i + 1).padStart(2, "0")}
								</span>
								<h3 style={{ fontSize: 22, lineHeight: "24px", letterSpacing: "0.02em", textTransform: "uppercase", margin: 0 }}>
									{svc.title}
								</h3>
								<p style={bodyCopy}>{svc.body}</p>
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
						padding: "60px 0 72px",
					}}
				>
					<figure className="blueprint ph-reveal duotone" style={{ margin: 0 }}>
						<Image
							src="/site-hoarding.jpg"
							alt="Clad hoarding screen cantilevered over a public footpath"
							width={1200}
							height={1600}
							sizes="(max-width: 720px) 100vw, 560px"
							style={{ width: "100%", height: "auto", display: "block" }}
						/>
						<Corners />
					</figure>
					<div>
						<span style={kicker}>03 · Why builders call us back</span>
						<hr style={kickerRule} />
						<h2 className="ph-reveal" style={sectionTitle}>
							Compliant is the minimum
						</h2>
						<p style={{ ...bodyCopy, margin: "16px 0 0", maxWidth: "48ch" }}>
							Anyone can stand a fence. We put up hoardings that survive a wind study, a council inspection and eighteen months of
							the public leaning on them — then come down on the day the program says. One crew, one engineer, one point of
							contact from quote to dismantle.
						</p>
						<div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginTop: 24 }}>
							<span className="tag tag-accent">AS 4687 certified</span>
							<span className="tag tag-outline">SafeWork NSW compliant</span>
							<span className="tag tag-outline">$20M public liability</span>
							<span className="tag tag-outline">Licensed installers</span>
						</div>
					</div>
				</section>

				<section id="projects" style={{ padding: "48px 0 60px" }}>
					<span style={kicker}>04 · Recent installations</span>
					<hr style={kickerRule} />
					<h2 className="ph-reveal" style={{ ...sectionTitle, margin: "0 0 8px" }}>
						On the street, right now
					</h2>
					<p style={{ fontSize: 13, lineHeight: "24px", margin: "0 0 32px", color: "color-mix(in srgb, var(--color-text) 70%, transparent)" }}>
						Hover to pause — drop your project photos straight onto the frames.
					</p>
					<div
						className="ph-rail ph-reveal"
						style={{ display: "flex", overflow: "hidden", maskImage: "linear-gradient(90deg, transparent, black 4%, black 96%, transparent)" }}
					>
						<ProjectRail projects={projects} />
						<ProjectRail projects={projects} hidden />
					</div>
				</section>

				<section style={{ padding: "60px 0 72px" }}>
					<span style={kicker}>05 · Word on site</span>
					<hr style={{ ...kickerRule, margin: "0 0 40px" }} />
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "48px clamp(24px, 5vw, 96px)" }}>
						{testimonials.map((t) => (
							<figure key={t.source} className="ph-reveal" style={{ margin: 0 }}>
								<blockquote
									style={{
										fontFamily: "var(--font-heading)",
										fontWeight: 600,
										fontSize: "clamp(24px, 2.4vw, 30px)",
										lineHeight: "36px",
										maxWidth: "36ch",
										margin: 0,
										textIndent: "-0.316em",
									}}
								>
									{t.quote}
								</blockquote>
								<figcaption
									style={{
										fontSize: 15,
										lineHeight: "24px",
										color: "color-mix(in srgb, var(--color-text) 70%, transparent)",
										margin: "24px 0 0",
										textIndent: "-0.885em",
									}}
								>
									{t.source}
								</figcaption>
							</figure>
						))}
					</div>
				</section>

				<section id="faq" style={{ padding: "48px 0 72px" }}>
					<span style={kicker}>06 · Questions we get on every job</span>
					<hr style={kickerRule} />
					<div style={{ maxWidth: "76ch" }}>
						{faqs.map((f, i) => (
							<details
								key={f.q}
								className="ph-reveal"
								style={{
									borderBottom: i === faqs.length - 1 ? undefined : "1px solid var(--color-divider)",
									padding: "16px 0",
								}}
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
			</div>

			<section id="quote" style={{ background: "var(--color-accent-900)", color: "var(--color-bg)" }}>
				<div
					style={{
						maxWidth: 1240,
						margin: "0 auto",
						padding: `clamp(56px, 7vw, 88px) ${pageGutter}`,
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
						gap: "48px clamp(24px, 5vw, 96px)",
						alignItems: "start",
					}}
				>
					<div>
						<span
							style={{
								display: "block",
								fontSize: 13,
								lineHeight: "12px",
								letterSpacing: "0.12em",
								textTransform: "uppercase",
								fontWeight: 600,
								color: "var(--color-accent-300)",
								margin: "0 0 16px",
							}}
						>
							07 · The quote desk
						</span>
						<h2
							className="ph-reveal"
							style={{
								fontSize: "clamp(36px, 4vw, 56px)",
								lineHeight: 1.04,
								letterSpacing: "0.02em",
								textTransform: "uppercase",
								margin: 0,
								color: "var(--color-bg)",
							}}
						>
							Get the hoarding priced
						</h2>
						<p
							style={{
								fontSize: 15,
								lineHeight: "24px",
								color: "color-mix(in srgb, var(--color-bg) 78%, transparent)",
								margin: "16px 0 0",
								maxWidth: "48ch",
							}}
						>
							Tell us where the site is and what&rsquo;s going up. We&rsquo;ll walk it, measure it and come back with an
							itemised price. No lump sums, no surprises at variation time.
						</p>
						<div style={{ marginTop: 32, fontSize: 15, lineHeight: "28px" }}>
							<div>
								<strong style={{ fontWeight: 600 }}>Phone</strong> —{" "}
								<a href={`tel:${company.phone.replace(/[^\d+]/g, "")}`} style={{ color: "var(--color-accent-300)" }}>
									{company.phone}
								</a>
							</div>
							<div>
								<strong style={{ fontWeight: 600 }}>Email</strong> —{" "}
								<a href={`mailto:${company.email}`} style={{ color: "var(--color-accent-300)" }}>
									{company.email}
								</a>
							</div>
							<div>
								<strong style={{ fontWeight: 600 }}>Yard</strong> — {company.yardSuburb}
							</div>
							<div>
								<strong style={{ fontWeight: 600 }}>Hours</strong> — {company.hours}
							</div>
						</div>
					</div>
					<div
						className="blueprint ph-reveal"
						style={{
							padding: 28,
							background: "var(--color-bg)",
							color: "var(--color-text)",
							borderColor: "color-mix(in srgb, var(--color-bg) 40%, transparent)",
						}}
					>
						<i className="corner tl" style={{ color: "color-mix(in srgb, var(--color-bg) 70%, transparent)" }}></i>
						<i className="corner tr" style={{ color: "color-mix(in srgb, var(--color-bg) 70%, transparent)" }}></i>
						<i className="corner bl" style={{ color: "color-mix(in srgb, var(--color-bg) 70%, transparent)" }}></i>
						<i className="corner br" style={{ color: "color-mix(in srgb, var(--color-bg) 70%, transparent)" }}></i>
						<QuoteForm phone={company.phone} />
					</div>
					<SiteFooter />
				</div>
			</section>
		</>
	);
}
