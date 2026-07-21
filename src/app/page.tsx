import type { CSSProperties } from "react";
import ImageSlot from "./image-slot";
import QuoteForm from "./quote-form";
import ScrollReveal from "./scroll-reveal";

const pageGutter = "clamp(20px, 5vw, 72px)";
const rise = (delay: string) => `ph-rise 0.9s cubic-bezier(0.22, 1, 0.36, 1) ${delay} both`;

const kicker: CSSProperties = {
	display: "block",
	fontSize: 13,
	lineHeight: "12px",
	letterSpacing: "0.08em",
	textTransform: "uppercase",
	fontWeight: 600,
	color: "var(--color-accent-700)",
	fontFeatureSettings: "'tnum' 1",
	margin: "0 0 12px",
};

const kickerRule: CSSProperties = { height: 1, border: 0, margin: "0 0 24px", background: "var(--color-divider)" };

const sectionTitle: CSSProperties = {
	fontSize: "clamp(32px, 3.4vw, 44px)",
	lineHeight: 1.06,
	letterSpacing: "0.02em",
	textTransform: "uppercase",
	margin: 0,
};

const bodyCopy: CSSProperties = {
	fontSize: 15,
	lineHeight: "24px",
	margin: 0,
	color: "color-mix(in srgb, var(--color-text) 78%, transparent)",
};

const clients = [
	"Harbourline Constructions",
	"Westgate Civil",
	"Meridian Developments",
	"Stonefield Group",
	"Axiom Build",
	"Port & Pier Projects",
	"Crestline Developers",
	"NSW Public Works",
];

const stats = [
	{ value: "A + B", accent: false, label: "Classes installed", detail: "Fence-type and overhead gantry" },
	{ value: "AS 4687", accent: true, label: "Certified to", detail: "Engineer-signed on every job" },
	{ value: "24 h", accent: false, label: "Quote turnaround", detail: "Measured site, itemised price" },
	{ value: "0", accent: true, label: "Failed inspections", detail: "Across every council we work in" },
];

const services = [
	{
		title: "Class A hoarding",
		body: "Fence-type hoarding at ground level — solid, plumb and lockable. Steel-framed ply or panel systems with dust control, sightline screening and pedestrian doors where the site needs them.",
	},
	{
		title: "Class B hoarding",
		body: "Overhead gantry protection where work happens above a footpath. Engineered decks rated to the drawings, under-awning lighting, and certification the council accepts.",
	},
	{
		title: "Temporary fencing",
		body: "Chain-mesh panels, braced, counterweighted and stood the same day. For the stages before the hoarding goes up and after it comes down.",
	},
	{
		title: "Signage & graphics wraps",
		body: "Full-print wraps, project signage and anti-graffiti laminate. The safest wall on the street may as well sell the building behind it.",
	},
	{
		title: "Design & certification",
		body: "Every hoarding drawn and signed to AS 4687 by our engineers. Load cases, tie-downs and documentation your certifier accepts the first time.",
	},
	{
		title: "Council permits",
		body: "We draw it, certify it and lodge it — hoarding permits, footpath occupation and traffic control plans. You build; we handle the paperwork.",
	},
];

const projects = [
	{ id: "proj-1", title: "Commercial tower", detail: "Class B gantry, 140 lm, Sydney CBD" },
	{ id: "proj-2", title: "Mixed-use development", detail: "Class A with full graphics wrap, Parramatta" },
	{ id: "proj-3", title: "Civic works", detail: "Temporary fencing and staged hoarding, Newcastle" },
	{ id: "proj-4", title: "Rail corridor upgrade", detail: "Class A, 300 lm staged program, Western Sydney" },
	{ id: "proj-5", title: "Heritage facade retention", detail: "Class B gantry with scaffold interface, The Rocks" },
	{ id: "proj-6", title: "Shopping centre works", detail: "Internal hoarding with graphics wrap, Chatswood" },
];

const testimonials = [
	{
		quote:
			"“They had the Class B up over the footpath in a weekend — certified, lit, and signed off by council before we'd finished demo.”",
		source: "— Site manager, tier-one builder, Sydney",
	},
	{
		quote:
			"“Quote on Tuesday, hoarding standing Friday. The graphics wrap made the client happier than the building did.”",
		source: "— Development director, North Sydney",
	},
];

const faqs = [
	{
		q: "Do I need council approval for a hoarding?",
		a: "If any part of the hoarding stands on or over public land — a footpath, a road reserve, a laneway — NSW councils require a hoarding permit before installation. We prepare the drawings, the engineering certification and the traffic management plan, and lodge the application for you.",
	},
	{
		q: "What's the difference between Class A and Class B?",
		a: "Class A is a fence-type hoarding at ground level — it separates the public from the site. Class B adds an engineered overhead deck that protects pedestrians from falling objects, and is required wherever work happens above a footpath that stays open.",
	},
	{
		q: "How fast can you install?",
		a: "You'll have a measured, itemised quote within 24 hours of the site walk. Class A hoardings typically stand within days of permit approval; Class B programs depend on the engineering and council timeline — we'll give you a date and hold it.",
	},
	{
		q: "Do you provide engineering certification?",
		a: "Yes — every hoarding we install is designed and signed off to AS 4687 by our engineers, with documentation you can hand straight to your certifier or principal contractor.",
	},
	{
		q: "Can you print our branding on the hoarding?",
		a: "Full-wrap printed graphics, project and marketing signage, and anti-graffiti laminate — plus all the statutory signage the site needs. Supply the artwork or have our studio lay it out.",
	},
];

function Corners() {
	return (
		<>
			<i className="corner tl"></i>
			<i className="corner tr"></i>
			<i className="corner bl"></i>
			<i className="corner br"></i>
		</>
	);
}

function ClientMarquee({ hidden }: { hidden?: boolean }) {
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

function ProjectRail({ hidden }: { hidden?: boolean }) {
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
						<ImageSlot placeholder="Drop a project photo" label={hidden ? undefined : "Project photograph"} />
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

export default function Home() {
	return (
		<>
			<ScrollReveal />

			<nav
				className="nav"
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					zIndex: 20,
					background: "transparent",
					borderBottom: 0,
					boxShadow: "none",
					color: "var(--color-bg)",
					paddingInline: `max(${pageGutter}, calc((100% - 1240px) / 2 + ${pageGutter}))`,
				}}
			>
				<span
					className="nav-brand"
					style={{ textTransform: "uppercase", letterSpacing: "0.04em", display: "inline-flex", alignItems: "baseline", gap: 10 }}
				>
					<span style={{ color: "var(--color-accent-300)", fontWeight: 400 }}>+</span>Pacific Hoardings
				</span>
				<a href="#services" className="ph-nav-link" style={{ whiteSpace: "nowrap" }}>
					Services
				</a>
				<a href="#projects" className="ph-nav-link" style={{ whiteSpace: "nowrap" }}>
					Projects
				</a>
				<a href="#faq" className="ph-nav-link" style={{ whiteSpace: "nowrap" }}>
					Q&amp;A
				</a>
				<a
					href="tel:1300000000"
					style={{ whiteSpace: "nowrap", color: "var(--color-bg)", fontFeatureSettings: "'tnum' 1", fontWeight: 600 }}
				>
					1300 000 000
				</a>
				<a
					href="#quote"
					className="ph-nav-cta"
					style={{
						whiteSpace: "nowrap",
						color: "var(--color-bg)",
						fontWeight: 600,
						letterSpacing: "0.06em",
						textTransform: "uppercase",
						borderBottom: "1px solid var(--color-accent-300)",
						paddingBottom: 2,
					}}
				>
					Request a quote
				</a>
			</nav>

			<section
				style={{
					position: "relative",
					minHeight: "100svh",
					display: "flex",
					flexDirection: "column",
					justifyContent: "flex-end",
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
				<div style={{ position: "relative", width: "100%", maxWidth: 1240, margin: "0 auto", padding: `140px ${pageGutter} 0` }}>
					<div style={{ maxWidth: "72ch" }}>
						<span
							style={{
								display: "block",
								fontSize: 13,
								lineHeight: "12px",
								letterSpacing: "0.12em",
								textTransform: "uppercase",
								fontWeight: 600,
								color: "var(--color-accent-300)",
								margin: "0 0 20px",
								animation: rise("0.1s"),
							}}
						>
							Class A + B hoardings · NSW · Australia-wide
						</span>
						<h1
							style={{
								fontFamily: "var(--font-heading)",
								fontWeight: 600,
								fontSize: "clamp(52px, 6vw, 88px)",
								lineHeight: 1.02,
								letterSpacing: "0.01em",
								textTransform: "uppercase",
								margin: "0 0 0 -0.052em",
								color: "var(--color-bg)",
								animation: rise("0.22s"),
							}}
						>
							<span style={{ display: "block" }}>Hoarding</span>
							<span style={{ display: "block" }}>that holds.</span>
							<span style={{ display: "block", color: "var(--color-accent-300)" }}>Paperwork</span>
							<span style={{ display: "block", color: "var(--color-accent-300)" }}>that passes.</span>
						</h1>
						<p
							style={{
								fontSize: 17,
								lineHeight: "26px",
								maxWidth: "52ch",
								margin: "28px 0 0",
								color: "color-mix(in srgb, var(--color-bg) 82%, transparent)",
								animation: rise("0.38s"),
							}}
						>
							We design, certify and install site hoardings for builders, developers and government — engineered to AS 4687,
							approved by council, and standing straight until the day you don&rsquo;t need them.
						</p>
						<div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap", marginTop: 32, animation: rise("0.52s") }}>
							<a href="#quote" className="btn btn-primary" style={{ minHeight: 44, paddingInline: 22, fontSize: 15 }}>
								Request a quote
							</a>
							<a
								href="#services"
								className="btn ph-hero-ghost"
								style={{
									minHeight: 44,
									paddingInline: 22,
									fontSize: 15,
									color: "var(--color-bg)",
									borderColor: "color-mix(in srgb, var(--color-bg) 45%, transparent)",
									background: "transparent",
								}}
							>
								See what we put up
							</a>
						</div>
					</div>
				</div>
				<div
					style={{
						position: "relative",
						marginTop: "clamp(56px, 8vh, 96px)",
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
							<ClientMarquee />
							<ClientMarquee hidden />
						</div>
					</div>
				</div>
			</section>

			<div style={{ maxWidth: 1240, margin: "0 auto", padding: `0 ${pageGutter}` }}>
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
								The numbers we&rsquo;re held to on every job. Values hold for metropolitan NSW; regional and interstate programs
								quoted to schedule.
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
						<ImageSlot placeholder="Drop a site photo — hoarding in place" label="Site photograph" />
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
						<ProjectRail />
						<ProjectRail hidden />
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
							Tell us where the site is and what&rsquo;s going up. We&rsquo;ll walk it, measure it and have an itemised price back
							within 24 hours. No lump sums, no surprises at variation time.
						</p>
						<div style={{ marginTop: 32, fontSize: 15, lineHeight: "28px" }}>
							<div>
								<strong style={{ fontWeight: 600 }}>Phone</strong> —{" "}
								<a href="tel:1300000000" style={{ color: "var(--color-accent-300)" }}>
									1300 000 000
								</a>
							</div>
							<div>
								<strong style={{ fontWeight: 600 }}>Email</strong> —{" "}
								<a href="mailto:quotes@pacifichoardings.com.au" style={{ color: "var(--color-accent-300)" }}>
									quotes@pacifichoardings.com.au
								</a>
							</div>
							<div>
								<strong style={{ fontWeight: 600 }}>Yard</strong> — 12 Placeholder Road, Wetherill Park NSW 2164
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
						<QuoteForm />
					</div>
					<footer
						style={{
							gridColumn: "1 / -1",
							paddingTop: 24,
							borderTop: "1px solid color-mix(in srgb, var(--color-bg) 22%, transparent)",
							fontSize: 13,
							lineHeight: "24px",
							color: "color-mix(in srgb, var(--color-bg) 65%, transparent)",
							display: "flex",
							flexWrap: "wrap",
							gap: "8px 32px",
							justifyContent: "space-between",
						}}
					>
						<span>Pacific Hoardings Pty Ltd · ABN 00 000 000 000</span>
						<span>NSW-based · Servicing Australia-wide</span>
					</footer>
				</div>
			</section>
		</>
	);
}
