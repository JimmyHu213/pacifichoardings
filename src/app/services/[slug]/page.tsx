import Link from "next/link";
import { notFound } from "next/navigation";
import { getServices } from "@/lib/content";
import { bodyCopy, kicker, kickerRule, pageGutter, sectionTitle } from "@/lib/style-tokens";

// Scaffold only — full content blocks (imagery, specs, related projects)
// come next phase from RESEARCH.md. This just gets the six service links off
// the nav working without 404s.
export async function generateStaticParams() {
	const services = await getServices();
	return services.map((service) => ({ slug: service.slug }));
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const services = await getServices();
	const service = services.find((s) => s.slug === slug);

	if (!service) {
		notFound();
	}

	return (
		<div style={{ maxWidth: 1240, margin: "0 auto", padding: `88px ${pageGutter} 96px` }}>
			<span style={kicker}>Services</span>
			<hr style={kickerRule} />
			<h1 style={{ ...sectionTitle, margin: "0 0 20px" }}>{service.title}</h1>
			<p style={{ ...bodyCopy, maxWidth: "64ch" }}>{service.body}</p>
			<Link href="/#quote" className="btn btn-primary" style={{ marginTop: 32, minHeight: 44, paddingInline: 22, fontSize: 15 }}>
				Request a quote
			</Link>
		</div>
	);
}
