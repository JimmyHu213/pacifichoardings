// Session cookie: a JSON payload (just an expiry) HMAC-signed with
// SESSION_SECRET via Web Crypto, so the worker doesn't need any server-side
// session store — the signature is the only thing that has to be trusted.
export const SESSION_COOKIE_NAME = "ph_admin_session";
export const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12h

interface SessionPayload {
	exp: number;
}

function toBase64Url(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) binary += String.fromCharCode(byte);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array<ArrayBuffer> {
	const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(value.length + ((4 - (value.length % 4)) % 4), "=");
	const binary = atob(padded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}

function importHmacKey(secret: string): Promise<CryptoKey> {
	return crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
		"sign",
		"verify",
	]);
}

export async function createSessionCookieValue(secret: string): Promise<string> {
	const payload: SessionPayload = { exp: Date.now() + SESSION_DURATION_MS };
	const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
	const key = await importHmacKey(secret);
	const signature = await crypto.subtle.sign("HMAC", key, payloadBytes);
	return `${toBase64Url(payloadBytes)}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionCookieValue(value: string | undefined, secret: string): Promise<boolean> {
	if (!value) return false;
	const [payloadB64, signatureB64] = value.split(".");
	if (!payloadB64 || !signatureB64) return false;

	try {
		const payloadBytes = fromBase64Url(payloadB64);
		const signatureBytes = fromBase64Url(signatureB64);
		const key = await importHmacKey(secret);
		const isValidSignature = await crypto.subtle.verify("HMAC", key, signatureBytes, payloadBytes);
		if (!isValidSignature) return false;

		const payload = JSON.parse(new TextDecoder().decode(payloadBytes)) as SessionPayload;
		return typeof payload.exp === "number" && payload.exp > Date.now();
	} catch {
		return false;
	}
}

// Constant-time comparison for the password check — crypto.subtle.verify
// above already gives the session signature check this property natively.
export function constantTimeEqual(a: string, b: string): boolean {
	const aBytes = new TextEncoder().encode(a);
	const bBytes = new TextEncoder().encode(b);
	const length = Math.max(aBytes.length, bBytes.length);
	let diff = aBytes.length ^ bBytes.length;
	for (let i = 0; i < length; i++) {
		diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
	}
	return diff === 0;
}
