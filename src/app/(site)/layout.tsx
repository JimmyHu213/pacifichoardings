import SiteHeader from "@/components/site-header";
import { getCompanyInfo, getServices } from "@/lib/content";

// Company info comes from D1 at request time; force-dynamic here keeps every
// (site) page's header/footer current instead of baking build-time values
// into statically-generated pages.
export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
	const [services, company] = await Promise.all([getServices(), getCompanyInfo()]);

	return (
		<>
			<SiteHeader services={services} phone={company.phone} />
			{children}
		</>
	);
}
