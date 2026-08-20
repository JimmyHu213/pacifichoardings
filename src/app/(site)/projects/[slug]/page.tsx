import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Corners from "@/components/corners";
import ProjectImage from "@/components/project-image";
import QuoteCta from "@/components/quote-cta";
import ScrollReveal from "@/components/scroll-reveal";
import { getProject, getServices } from "@/lib/content";
import { bodyCopy, kicker, kickerRule, pageGutter, sectionTitle } from "@/lib/style-tokens";

// The (site) layout already forces dynamic rendering, but declare it here
// too so this page can never silently regress to cached galleries if the
// layout config narrows.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
	const { slug } = await params;
	const project = await getProject(slug);
	if (!project) return { title: "Project — Pacific Hoardings" };
	return {
		title: `${project.title} — Pacific Hoardings`,
		description: project.description.slice(0, 160),
	};
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const [project, services] = await Promise.all([getProject(slug), getServices()]);
	if (!project) notFound();
	const serviceTitle = services.find((s) => s.slug === project.serviceSlug)?.title;

	return (
		<>
			<ScrollReveal />

			<div className="ph-sheet" style={{ maxWidth: 1240, margin: "0 auto", padding: `0 ${pageGutter}` }}>
				<section style={{ padding: "56px 0 32px" }}>
					<span style={kicker}>
						<Link href="/projects" style={{ color: "inherit", textDecoration: "none" }}>
							Projects
						</Link>
					</span>
					<hr style={kickerRule} />
					<h1 className="ph-reveal" style={{ ...sectionTitle, fontSize: "clamp(36px, 4.4vw, 60px)", margin: "0 0 12px" }}>
						{project.title}
					</h1>
					<p style={{ fontSize: 13, lineHeight: "20px", margin: "0 0 16px", color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>
						{project.detail} · {project.timeframe}
					</p>
					{serviceTitle && (
						<Link href={`/services/${project.serviceSlug}`} className="tag tag-accent" style={{ textDecoration: "none" }}>
							{serviceTitle}
						</Link>
					)}
					<p className="ph-reveal" style={{ ...bodyCopy, maxWidth: "64ch", margin: "20px 0 0" }}>
						{project.description}
					</p>
				</section>

				<section style={{ padding: "16px 0 72px", display: "grid", gap: 24 }}>
					{project.images.length === 0 && (
						<figure className="blueprint duotone" style={{ margin: 0 }}>
							<ProjectImage image={project.cover} />
							<Corners />
						</figure>
					)}
					{project.images.map((image) => (
						<figure key={image.key} className="blueprint duotone ph-reveal" style={{ margin: 0 }}>
							<ProjectImage image={image} />
							<Corners />
						</figure>
					))}
				</section>
			</div>

			<QuoteCta heading="Get your project priced" />
		</>
	);
}
