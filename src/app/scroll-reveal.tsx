"use client";

import { useEffect } from "react";

/* Adds .is-in to .ph-reveal elements as they enter the viewport, staggering
   siblings by 90ms — same behaviour as the reference page. */
export default function ScrollReveal() {
	useEffect(() => {
		const io = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						e.target.classList.add("is-in");
						io.unobserve(e.target);
					}
				});
			},
			{ threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
		);
		document.querySelectorAll<HTMLElement>(".ph-reveal").forEach((el) => {
			const sibs = Array.from(el.parentElement?.children ?? []).filter((c) =>
				c.classList.contains("ph-reveal"),
			);
			const i = sibs.indexOf(el);
			if (i > 0) el.style.transitionDelay = `${Math.min(i, 6) * 90}ms`;
			io.observe(el);
		});
		return () => io.disconnect();
	}, []);
	return null;
}
