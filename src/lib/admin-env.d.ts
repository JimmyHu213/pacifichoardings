// ADMIN_PASSWORD and SESSION_SECRET are Workers secrets (`wrangler secret put`
// in production, .dev.vars locally) — they never live in wrangler.jsonc, so
// `wrangler types` doesn't know about them. This augments the generated
// CloudflareEnv interface in cloudflare-env.d.ts; re-running `cf-typegen`
// regenerates that file but doesn't touch this one.
declare global {
	interface CloudflareEnv {
		ADMIN_PASSWORD?: string;
		SESSION_SECRET?: string;
	}
}

export {};
