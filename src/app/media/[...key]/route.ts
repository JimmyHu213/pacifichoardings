import { getCloudflareContext } from "@opennextjs/cloudflare";

// Serves project photos straight out of R2 on the site's own origin, so no
// custom R2 domain is needed and next/image can still optimize them like any
// same-origin asset. Keys are never reused (uploads get a timestamp suffix),
// which is what makes the immutable cache header safe.
export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
	const { key } = await params;
	const objectKey = key.join("/");

	const { env } = await getCloudflareContext({ async: true });
	const object = await env.PROJECT_IMAGES.get(objectKey);

	if (!object) {
		return new Response("Not found", { status: 404 });
	}

	return new Response(object.body, {
		headers: {
			"Content-Type": object.httpMetadata?.contentType ?? "application/octet-stream",
			"Cache-Control": "public, max-age=31536000, immutable",
			ETag: object.httpEtag,
		},
	});
}
