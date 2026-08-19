import { describe, expect, it } from "vitest";
import { generateOtpCode, hashOtpCode, OTP_MAX_ATTEMPTS, OTP_RESEND_COOLDOWN_MS, OTP_TTL_MS } from "./admin-otp";

describe("generateOtpCode", () => {
	it("always returns a 6-digit numeric string", () => {
		for (let i = 0; i < 500; i++) {
			expect(generateOtpCode()).toMatch(/^\d{6}$/);
		}
	});

	it("returns varying codes", () => {
		const codes = new Set(Array.from({ length: 50 }, () => generateOtpCode()));
		expect(codes.size).toBeGreaterThan(1);
	});
});

describe("hashOtpCode", () => {
	it("returns the SHA-256 hex digest of the code", async () => {
		// Well-known vector: sha256("123456")
		expect(await hashOtpCode("123456")).toBe("8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92");
	});

	it("differs for different codes", async () => {
		expect(await hashOtpCode("000000")).not.toBe(await hashOtpCode("000001"));
	});
});

describe("constants", () => {
	it("match the spec", () => {
		expect(OTP_TTL_MS).toBe(10 * 60 * 1000);
		expect(OTP_MAX_ATTEMPTS).toBe(5);
		expect(OTP_RESEND_COOLDOWN_MS).toBe(60 * 1000);
	});
});
