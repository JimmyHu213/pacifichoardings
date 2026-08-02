import Image from "next/image";
import ImageSlot from "./image-slot";
import type { ProjectImage as ProjectImageData } from "@/lib/content";

// Fallback shape for photos whose pixel size predates the image_width /
// image_height columns — the 4:3 crop these were originally designed around.
const FALLBACK_WIDTH = 880;
const FALLBACK_HEIGHT = 660;

// Renders the real R2-hosted photo once one has been uploaded through the
// admin, and falls back to the ImageSlot placeholder frame until then.
//
// "gallery" lets the photo keep its own aspect ratio — the upward shots of the
// gantry decks are portrait, and a 4:3 crop cuts the deck out of frame.
// "rail" keeps the uniform 4:3 box the home marquee is built around, so the
// scrolling band stays one consistent height.
export default function ProjectImage({
	image,
	variant = "gallery",
}: {
	image: ProjectImageData;
	variant?: "gallery" | "rail";
}) {
	if (!image.key) {
		return <ImageSlot placeholder={image.placeholder} label={image.label} />;
	}

	const hasSize = image.width !== null && image.height !== null;

	return (
		<Image
			src={`/media/${image.key}`}
			alt={image.label}
			width={image.width ?? FALLBACK_WIDTH}
			height={image.height ?? FALLBACK_HEIGHT}
			sizes={variant === "rail" ? "440px" : "(max-width: 720px) 100vw, 560px"}
			style={
				variant === "rail" || !hasSize
					? { width: "100%", height: "auto", aspectRatio: "4 / 3", objectFit: "cover", display: "block" }
					: { width: "100%", height: "auto", display: "block" }
			}
		/>
	);
}
