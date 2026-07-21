import type { Metadata } from "next";
import Link from "next/link";
import Corners from "@/components/corners";
import ImageSlot from "@/components/image-slot";
import QuoteCta from "@/components/quote-cta";
import ScrollReveal from "@/components/scroll-reveal";
import { getProjects, getServices } from "@/lib/content";
import { bodyCopy, kicker, kickerRule, pageGutter, sectionTitle } from "@/lib/style-tokens";

export const metadata: Metadata = {
	title: "Projects — Pacific Hoardings",
	description: "Class A and Class B hoardings, temporary fencing and graphics wraps we've put up across NSW.",
};

export default async function ProjectsPage() {
	const [projects, services] = await Promise.all([getProjects(), getServices()]);
	const serviceTitleBySlug = new Map(services.map((s) => [s.slug, s.title]));

	return (
		<>
			<ScrollReveal />

			<div style={{ maxWidth: 1240, margin: "0 auto", padding: `0 ${pageGutter}` }}>
				<section style={{ padding: "56px 0 48px" }}>
					<span style={kicker}>Projects</span>
					<hr style={kickerRule} />
					<h1 className="ph-reveal" style={{ ...sectionTitle, fontSize: "clamp(36px, 4.4vw, 60px)", margin: "0 0 16px" }}>
						On the street, right now
					</h1>
					<p
						className="ph-reveal"
						style={{ fontSize: 18, lineHeight: "28px", maxWidth: "56ch", margin: 0, color: "color-mix(in srgb, var(--color-text) 78%, transparent)" }}
					>
						A sample of the hoardings we&rsquo;ve designed, certified and installed across metropolitan and regional NSW — every one
						engineered to AS 4687 and signed off before it went up.
					</p>
				</section>

				<section style={{ padding: "24px 0 72px" }}>
					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "clamp(32px, 4vw, 56px)" }}>
						{projects.map((project) => (
							<article key={project.id} className="ph-reveal">
								<figure className="blueprint duotone" style={{ margin: 0 }}>
									<ImageSlot placeholder={project.image.placeholder} label={project.image.label} />
									<Corners />
								</figure>
								<div style={{ marginTop: 16 }}>
									<Link href={`/services/${project.serviceSlug}`} className="tag tag-accent" style={{ textDecoration: "none" }}>
										{serviceTitleBySlug.get(project.serviceSlug)}
									</Link>
									<h2 style={{ fontSize: 22, lineHeight: "24px", letterSpacing: "0.02em", textTransform: "uppercase", margin: "12px 0 4px" }}>
										{project.title}
									</h2>
									<p
										style={{
											fontSize: 13,
											lineHeight: "20px",
											margin: "0 0 12px",
											color: "color-mix(in srgb, var(--color-text) 60%, transparent)",
										}}
									>
										{project.detail} · {project.timeframe}
									</p>
									<p style={{ ...bodyCopy, maxWidth: "48ch" }}>{project.description}</p>
								</div>
							</article>
						))}
					</div>
				</section>
			</div>

			<QuoteCta heading="Get your project priced" />
		</>
	);
}
