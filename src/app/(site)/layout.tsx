import SiteHeader from "@/components/site-header";
import { getServices } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
	const services = await getServices();

	return (
		<>
			<SiteHeader services={services} />
			{children}
		</>
	);
}
