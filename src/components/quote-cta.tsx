import Link from "next/link";
import { pageGutter } from "@/lib/style-tokens";

export default function QuoteCta({ heading }: { heading: string }) {
	return (
		<section style={{ background: "var(--color-accent-900)", color: "var(--color-bg)" }}>
			<div style={{ maxWidth: 1240, margin: "0 auto", padding: `clamp(56px, 7vw, 88px) ${pageGutter}`, textAlign: "center" }}>
				<span
					style={{
						display: "block",
						fontSize: 13,
						letterSpacing: "0.12em",
						textTransform: "uppercase",
						fontWeight: 600,
						color: "var(--color-accent-300)",
						margin: "0 0 16px",
					}}
				>
					The quote desk
				</span>
				<h2
					className="ph-reveal"
					style={{
						fontSize: "clamp(32px, 3.6vw, 48px)",
						lineHeight: 1.04,
						letterSpacing: "0.02em",
						textTransform: "uppercase",
						margin: "0 auto",
						maxWidth: "22ch",
						color: "var(--color-bg)",
					}}
				>
					{heading}
				</h2>
				<p
					style={{
						fontSize: 15,
						lineHeight: "24px",
						color: "color-mix(in srgb, var(--color-bg) 78%, transparent)",
						margin: "16px auto 0",
						maxWidth: "48ch",
					}}
				>
					Tell us where the site is and what&rsquo;s going up. We&rsquo;ll walk it, measure it and have an itemised price back within 24
					hours.
				</p>
				<div style={{ marginTop: 32 }}>
					<Link href="/#quote" className="btn btn-primary" style={{ minHeight: 44, paddingInline: 22, fontSize: 15 }}>
						Request a quote
					</Link>
				</div>
			</div>
		</section>
	);
}
