import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServices } from "@/lib/content";
import { pageGutter } from "@/lib/style-tokens";
import ServiceForm, { type ServiceFormValues } from "../../service-form";

export const metadata: Metadata = { title: "Edit service — Pacific Hoardings Admin" };

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;
	const services = await getServices();
	const service = services.find((s) => s.slug === slug);

	if (!service) {
		notFound();
	}

	const values: ServiceFormValues = {
		slug: service.slug,
		title: service.title,
		tagline: service.tagline,
		body: service.body,
		overview: service.overview,
		whenYouNeedIt: service.whenYouNeedIt,
		specs: service.specs,
		process: service.process,
		complianceTags: service.complianceTags,
		images: service.images.map((img) => ({ key: img.key, alt: img.alt })),
		sortOrder: service.sortOrder,
	};

	return (
		<div style={{ maxWidth: 1400, margin: "0 auto", padding: `32px ${pageGutter} 64px` }}>
			<h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 24, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 24px" }}>
				Edit service
			</h1>
			<ServiceForm initial={values} />
		</div>
	);
}
