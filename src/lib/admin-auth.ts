import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, verifySessionCookieValue } from "@/lib/admin-session";

// Server actions are standalone POST endpoints — the (protected) layout's
// redirect guards page rendering, not mutation. Every admin action calls
// this first so an unauthenticated POST can never write.
export async function requireAdminSession(): Promise<void> {
	const cookieStore = await cookies();
	const { env } = await getCloudflareContext({ async: true });
	const isAuthed = env.SESSION_SECRET
		? await verifySessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)?.value, env.SESSION_SECRET)
		: false;
	if (!isAuthed) {
		redirect("/admin/login");
	}
}
