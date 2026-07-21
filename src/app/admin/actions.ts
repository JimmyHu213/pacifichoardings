"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { constantTimeEqual, createSessionCookieValue, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/admin-session";

export type LoginState = { status: "idle" } | { status: "error"; message: string };

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
	const password = formData.get("password");
	if (typeof password !== "string" || !password) {
		return { status: "error", message: "Enter the password." };
	}

	// Sync mode is rejected by OpenNext whenever the calling route could be
	// static — async mode is required (see quote-actions.ts for the same note).
	const { env } = await getCloudflareContext({ async: true });
	const adminPassword = env.ADMIN_PASSWORD;
	const sessionSecret = env.SESSION_SECRET;

	if (!adminPassword || !sessionSecret) {
		console.error("Admin auth is not configured — missing ADMIN_PASSWORD or SESSION_SECRET");
		return { status: "error", message: "Admin login isn't configured yet." };
	}

	if (!constantTimeEqual(password, adminPassword)) {
		return { status: "error", message: "Wrong password." };
	}

	const cookieStore = await cookies();
	cookieStore.set(SESSION_COOKIE_NAME, await createSessionCookieValue(sessionSecret), {
		httpOnly: true,
		secure: true,
		sameSite: "lax",
		path: "/",
		maxAge: SESSION_DURATION_MS / 1000,
	});

	redirect("/admin");
}

export async function logoutAction(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE_NAME);
	redirect("/admin/login");
}
