"use client";

import { useEffect, useState } from "react";

// Every admin form submits through a server action, which only works once
// React has hydrated the page. If the admin's JavaScript fails to load or
// throws on the way up, the page still renders perfectly and every Save
// button silently does nothing — the failure mode is invisible, which makes
// it very hard to report or diagnose. This says so on screen instead.
export default function AdminReady() {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- the point is to flip once, after hydration proves JS is running
		setReady(true);
	}, []);

	if (ready) return null;

	return (
		<p
			role="status"
			style={{
				margin: 0,
				padding: "8px 10px",
				border: "1px solid var(--color-divider)",
				borderLeft: "3px solid var(--color-accent-700)",
				background: "var(--color-surface)",
				fontSize: 12,
				lineHeight: "16px",
			}}
		>
			Still loading — saving won&rsquo;t work until this message disappears.
		</p>
	);
}
