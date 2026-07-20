/* Placeholder image frame — stands in for the reference's <image-slot>
   drop targets until real site photography goes in. */
export default function ImageSlot({ placeholder, label }: { placeholder: string; label?: string }) {
	return (
		<div
			role={label ? "img" : undefined}
			aria-label={label}
			style={{
				width: "100%",
				aspectRatio: "4 / 3",
				display: "grid",
				placeItems: "center",
				padding: 16,
				background:
					"repeating-linear-gradient(45deg, transparent 0 10px, color-mix(in srgb, var(--color-text) 4%, transparent) 10px 11px), var(--color-surface)",
			}}
		>
			<span
				style={{
					fontSize: 12,
					lineHeight: "18px",
					letterSpacing: "0.08em",
					textTransform: "uppercase",
					textAlign: "center",
					color: "color-mix(in srgb, var(--color-text) 45%, transparent)",
				}}
			>
				{placeholder}
			</span>
		</div>
	);
}
