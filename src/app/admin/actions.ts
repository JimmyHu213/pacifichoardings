"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { constantTimeEqual, createSessionCookieValue, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/admin-session";

export type LoginState = { status: "idle" } | { status: "error"; message: string };

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Validate the Turnstile token with Cloudflare's siteverify endpoint. Returns
// false on any failure — a missing token, a rejected token, or a non-200
// response — so the caller fails closed.
async function verifyTurnstile(token: string, secret: string, remoteIp: string | null): Promise<boolean> {
	const body = new URLSearchParams({ secret, response: token });
	if (remoteIp) body.set("remoteip", remoteIp);

	try {
		const response = await fetch(TURNSTILE_VERIFY_URL, {
			method: "POST",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			body,
		});
		if (!response.ok) return false;
		const outcome = (await response.json()) as { success?: boolean };
		return outcome.success === true;
	} catch (error) {
		console.error("Turnstile verification request failed", error);
		return false;
	}
}

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
	const turnstileSecret = env.TURNSTILE_SECRET_KEY;

	if (!adminPassword || !sessionSecret || !turnstileSecret) {
		console.error("Admin auth is not configured — missing ADMIN_PASSWORD, SESSION_SECRET, or TURNSTILE_SECRET_KEY");
		return { status: "error", message: "Admin login isn't configured yet." };
	}

	// Gate on the Turnstile challenge before the password is even compared, so
	// automated password-guessing never reaches the credential check.
	const turnstileToken = formData.get("cf-turnstile-response");
	if (typeof turnstileToken !== "string" || !turnstileToken) {
		return { status: "error", message: "Complete the verification challenge." };
	}
	const remoteIp = (await headers()).get("CF-Connecting-IP");
	if (!(await verifyTurnstile(turnstileToken, turnstileSecret, remoteIp))) {
		return { status: "error", message: "Verification failed — please try again." };
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
