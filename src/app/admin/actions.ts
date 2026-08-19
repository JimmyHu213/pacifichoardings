"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { constantTimeEqual, createSessionCookieValue, SESSION_COOKIE_NAME, SESSION_DURATION_MS } from "@/lib/admin-session";
import { generateOtpCode, hashOtpCode, OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS } from "@/lib/admin-otp";

export type LoginState = { status: "idle" } | { status: "error"; message: string };
export type OtpRequestState = { status: "idle" } | { status: "sent" } | { status: "error"; message: string };
export type OtpVerifyState = { status: "idle" } | { status: "error"; message: string };

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Every requestOtpAction outcome is padded to this floor so response timing
// doesn't hint at whether the address matched, a code was actually sent, or
// the resend cooldown suppressed it.
const OTP_REQUEST_MIN_MS = 1000;

async function padOtpResponse(startedAt: number): Promise<void> {
	const elapsed = Date.now() - startedAt;
	if (elapsed < OTP_REQUEST_MIN_MS) {
		await new Promise((resolve) => setTimeout(resolve, OTP_REQUEST_MIN_MS - elapsed));
	}
}

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

export async function requestOtpAction(_prevState: OtpRequestState, formData: FormData): Promise<OtpRequestState> {
	const startedAt = Date.now();

	const email = formData.get("email");
	if (typeof email !== "string" || !email.trim()) {
		return { status: "error", message: "Enter your email address." };
	}

	const { env } = await getCloudflareContext({ async: true });
	const adminEmail = env.ADMIN_EMAIL;
	const turnstileSecret = env.TURNSTILE_SECRET_KEY;
	const otpEmail = env.OTP_EMAIL;
	if (!adminEmail || !turnstileSecret || !otpEmail) {
		console.error("OTP login is not configured — missing ADMIN_EMAIL, TURNSTILE_SECRET_KEY, or the OTP_EMAIL binding");
		return { status: "error", message: "Email login isn't configured yet." };
	}

	// Same gate as loginAction: the Turnstile challenge runs before anything
	// else, so bots can't use this action to spray emails or probe addresses.
	const turnstileToken = formData.get("cf-turnstile-response");
	if (typeof turnstileToken !== "string" || !turnstileToken) {
		return { status: "error", message: "Complete the verification challenge." };
	}
	const remoteIp = (await headers()).get("CF-Connecting-IP");
	if (!(await verifyTurnstile(turnstileToken, turnstileSecret, remoteIp))) {
		return { status: "error", message: "Verification failed — please try again." };
	}

	// Any address that isn't the admin's gets the same "sent" response as a
	// real send, so this page never confirms which email is the admin one.
	if (!constantTimeEqual(email.trim().toLowerCase(), adminEmail.toLowerCase())) {
		await padOtpResponse(startedAt);
		return { status: "sent" };
	}

	const now = Date.now();
	try {
		// Opportunistic cleanup keeps the table tiny without a scheduled job.
		await env.DB.prepare("DELETE FROM admin_otp_codes WHERE expires_at < ?1 OR consumed_at IS NOT NULL").bind(now).run();

		// Cooldown: if a live code was issued in the last minute, quietly skip
		// the send — the earlier code still works.
		const recent = await env.DB.prepare("SELECT id FROM admin_otp_codes WHERE created_at > ?1 LIMIT 1")
			.bind(now - OTP_RESEND_COOLDOWN_MS)
			.first();
		if (recent) {
			await padOtpResponse(startedAt);
			return { status: "sent" };
		}

		const code = generateOtpCode();
		const insert = await env.DB.prepare("INSERT INTO admin_otp_codes (code_hash, expires_at, created_at) VALUES (?1, ?2, ?3)")
			.bind(await hashOtpCode(code), now + OTP_TTL_MS, now)
			.run();

		try {
			await otpEmail.send({
				to: adminEmail,
				from: { email: "no-reply@pacifichoardings.com.au", name: "Pacific Hoardings" },
				subject: `${code} is your Pacific Hoardings admin code`,
				text: `Your Pacific Hoardings admin login code is ${code}.\n\nIt expires in 10 minutes. If you didn't request it, you can ignore this email.`,
			});
		} catch (error) {
			// A code the admin never received must not block the resend cooldown
			// or shadow an older deliverable code — drop it before failing.
			await env.DB.prepare("DELETE FROM admin_otp_codes WHERE id = ?1").bind(insert.meta.last_row_id).run();
			throw error;
		}
	} catch (error) {
		console.error("OTP request failed", error);
		await padOtpResponse(startedAt);
		return { status: "error", message: "Couldn't send the code — please try again." };
	}

	await padOtpResponse(startedAt);
	return { status: "sent" };
}

export async function verifyOtpAction(_prevState: OtpVerifyState, formData: FormData): Promise<OtpVerifyState> {
	const rawCode = formData.get("code");
	const code = typeof rawCode === "string" ? rawCode.trim() : "";
	if (!/^\d{6}$/.test(code)) {
		return { status: "error", message: "Enter the 6-digit code from the email." };
	}

	const { env } = await getCloudflareContext({ async: true });
	const sessionSecret = env.SESSION_SECRET;
	if (!sessionSecret) {
		console.error("OTP login is not configured — missing SESSION_SECRET");
		return { status: "error", message: "Email login isn't configured yet." };
	}

	const now = Date.now();
	let valid = false;
	try {
		const row = await env.DB.prepare(
			"SELECT id, code_hash FROM admin_otp_codes WHERE consumed_at IS NULL AND expires_at > ?1 ORDER BY created_at DESC LIMIT 1",
		)
			.bind(now)
			.first<{ id: number; code_hash: string }>();
		if (!row) {
			return { status: "error", message: "That code is no longer valid — request a new one." };
		}

		// Burn the attempt atomically: the WHERE clause enforces the cap even when
		// requests race, so concurrent guesses can't stretch the 5-attempt budget,
		// and a crash mid-check still can't grant free retries.
		const burn = await env.DB.prepare("UPDATE admin_otp_codes SET attempts = attempts + 1 WHERE id = ?1 AND attempts < ?2")
			.bind(row.id, OTP_MAX_ATTEMPTS)
			.run();
		if (!burn.meta.changes) {
			return { status: "error", message: "That code is no longer valid — request a new one." };
		}

		valid = constantTimeEqual(await hashOtpCode(code), row.code_hash);
		if (valid) {
			await env.DB.prepare("UPDATE admin_otp_codes SET consumed_at = ?1 WHERE id = ?2").bind(now, row.id).run();
		}
	} catch (error) {
		console.error("OTP verification failed", error);
		return { status: "error", message: "Something went wrong — please try again." };
	}

	if (!valid) {
		return { status: "error", message: "Wrong code — check the email and try again." };
	}

	// Same session cookie as the password path — redirect() throws, so it must
	// stay outside the try/catch above.
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
