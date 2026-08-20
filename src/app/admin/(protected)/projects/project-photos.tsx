"use client";

import { useActionState, useState } from "react";
import {
	addProjectPhotoAction,
	deleteProjectPhotoAction,
	updateProjectPhotoAction,
	type PhotoFormState,
} from "./actions";

const initialState: PhotoFormState = { status: "idle" };

export interface ProjectPhotoValues {
	id: string;
	imageKey: string;
	imageAlt: string;
	sortOrder: number;
}

export default function ProjectPhotos({ projectId, photos }: { projectId: string; photos: ProjectPhotoValues[] }) {
	const [state, addAction, isPending] = useActionState(addProjectPhotoAction, initialState);
	const [dims, setDims] = useState<{ width: number; height: number } | null>(null);

	async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
		const file = event.target.files?.[0];
		if (!file) {
			setDims(null);
			return;
		}
		try {
			// Decode locally to record the photo's native size, so the public
			// gallery can render it at its own aspect ratio instead of 4:3.
			const bitmap = await createImageBitmap(file);
			setDims({ width: bitmap.width, height: bitmap.height });
			bitmap.close();
		} catch {
			setDims(null);
		}
	}

	return (
		<section style={{ marginTop: 40, maxWidth: 760 }}>
			<h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 18, textTransform: "uppercase", letterSpacing: "0.02em", margin: "0 0 6px" }}>
				Photos
			</h2>
			<p style={{ fontSize: 13, lineHeight: "20px", margin: "0 0 16px", color: "color-mix(in srgb, var(--color-text) 60%, transparent)" }}>
				The photo with the lowest sort order is the cover shown on the projects page and home marquee.
			</p>

			{photos.map((photo) => (
				<form
					key={photo.id}
					action={updateProjectPhotoAction}
					style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12, padding: "14px 0", borderTop: "1px solid var(--color-divider)" }}
				>
					<input type="hidden" name="id" value={photo.id} />
					<input type="hidden" name="project_id" value={projectId} />
					{/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail, no optimizer for /media */}
					<img src={`/media/${photo.imageKey}`} alt={photo.imageAlt || "Project photo"} style={{ width: 96, height: 72, objectFit: "cover", display: "block" }} />
					<div className="field" style={{ flex: "1 1 200px" }}>
						<label htmlFor={`photo-alt-${photo.id}`}>Alt text</label>
						<input className="input" id={`photo-alt-${photo.id}`} name="image_alt" type="text" defaultValue={photo.imageAlt} />
					</div>
					<div className="field" style={{ width: 90 }}>
						<label htmlFor={`photo-sort-${photo.id}`}>Sort</label>
						<input className="input" id={`photo-sort-${photo.id}`} name="sort_order" type="number" defaultValue={photo.sortOrder} />
					</div>
					<button type="submit" className="btn" style={{ minHeight: 38 }}>
						Save
					</button>
					<button type="submit" className="btn" style={{ minHeight: 38 }} formAction={deleteProjectPhotoAction}>
						Delete
					</button>
				</form>
			))}

			<form action={addAction} style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: 12, padding: "14px 0", borderTop: "1px solid var(--color-divider)" }}>
				{state.status === "error" && (
					<div
						role="alert"
						style={{
							flexBasis: "100%",
							padding: "12px 14px",
							border: "1px solid var(--color-divider)",
							borderLeft: "3px solid var(--color-accent-700)",
							background: "var(--color-surface)",
							fontSize: 13,
							lineHeight: "20px",
						}}
					>
						{state.message}
					</div>
				)}
				<input type="hidden" name="project_id" value={projectId} />
				<div className="field" style={{ flex: "1 1 200px" }}>
					<label htmlFor="photo-new">Add photo</label>
					<input className="input" id="photo-new" name="image" type="file" accept="image/*" required onChange={onFileChange} />
				</div>
				<div className="field" style={{ flex: "1 1 200px" }}>
					<label htmlFor="photo-new-alt">Alt text</label>
					<input className="input" id="photo-new-alt" name="image_alt" type="text" />
				</div>
				<input type="hidden" name="width" value={dims?.width ?? ""} />
				<input type="hidden" name="height" value={dims?.height ?? ""} />
				<button type="submit" className="btn btn-primary" style={{ minHeight: 38 }} disabled={isPending}>
					{isPending ? "Uploading…" : "Upload"}
				</button>
			</form>
		</section>
	);
}
