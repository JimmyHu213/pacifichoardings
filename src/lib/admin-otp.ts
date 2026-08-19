// One-time codes for the admin email login. Only the SHA-256 hash of a code
// is ever stored (admin_otp_codes in D1); these helpers are pure Web Crypto
// so they unit-test without a Worker runtime.
export const OTP_TTL_MS = 10 * 60 * 1000; // codes expire after 10 minutes
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

// Largest multiple of 10^6 that fits in a Uint32 — values at or above it are
// re-rolled so every code from 000000 to 999999 stays equally likely.
const UNBIASED_LIMIT = 4_294_000_000;

export function generateOtpCode(): string {
	const buffer = new Uint32Array(1);
	let value: number;
	do {
		crypto.getRandomValues(buffer);
		value = buffer[0];
	} while (value >= UNBIASED_LIMIT);
	return String(value % 1_000_000).padStart(6, "0");
}

export async function hashOtpCode(code: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(code));
	return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
