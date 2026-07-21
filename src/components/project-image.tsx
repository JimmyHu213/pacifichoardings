import Image from "next/image";
import ImageSlot from "./image-slot";
import type { ProjectImage as ProjectImageData } from "@/lib/content";

// Renders the real R2-hosted photo once one has been uploaded through the
// admin, and falls back to the ImageSlot placeholder frame until then.
export default function ProjectImage({ image }: { image: ProjectImageData }) {
	if (!image.key) {
		return <ImageSlot placeholder={image.placeholder} label={image.label} />;
	}

	return (
		<Image
			src={`/media/${image.key}`}
			alt={image.label}
			width={880}
			height={660}
			style={{ width: "100%", height: "auto", aspectRatio: "4 / 3", objectFit: "cover", display: "block" }}
		/>
	);
}
