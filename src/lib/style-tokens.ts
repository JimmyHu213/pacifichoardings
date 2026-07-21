// Shared inline-style constants used by more than one component.
// See .planning/DEV-PLAN.md §3 — only values actually shared move here.
import type { CSSProperties } from "react";

export const pageGutter = "clamp(20px, 5vw, 72px)";

export const kicker: CSSProperties = {
	display: "block",
	fontSize: 13,
	lineHeight: "12px",
	letterSpacing: "0.08em",
	textTransform: "uppercase",
	fontWeight: 600,
	color: "var(--color-accent-700)",
	fontFeatureSettings: "'tnum' 1",
	margin: "0 0 12px",
};

export const kickerRule: CSSProperties = { height: 1, border: 0, margin: "0 0 24px", background: "var(--color-divider)" };

export const sectionTitle: CSSProperties = {
	fontSize: "clamp(32px, 3.4vw, 44px)",
	lineHeight: 1.06,
	letterSpacing: "0.02em",
	textTransform: "uppercase",
	margin: 0,
};

export const bodyCopy: CSSProperties = {
	fontSize: 15,
	lineHeight: "24px",
	margin: 0,
	color: "color-mix(in srgb, var(--color-text) 78%, transparent)",
};
