import type { Metadata } from "next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import SiteHeader from "@/components/site-header";
import { getServices } from "@/lib/content";
import "./globals.css";

const barlow = Barlow({
	variable: "--font-barlow",
	weight: ["400", "500", "600", "700"],
	subsets: ["latin", "latin-ext"],
});

const barlowCondensed = Barlow_Condensed({
	variable: "--font-barlow-condensed",
	weight: ["400", "600"],
	subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
	title: "Pacific Hoardings — Hoarding that holds. Paperwork that passes.",
	description:
		"We design, certify and install site hoardings for builders, developers and government — engineered to AS 4687, approved by council, and standing straight until the day you don't need them.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const services = await getServices();

	return (
		<html lang="en" data-scroll-behavior="smooth">
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className={`${barlow.variable} ${barlowCondensed.variable}`}>
				<SiteHeader services={services} />
				{children}
			</body>
		</html>
	);
}
