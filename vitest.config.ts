import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Playwright owns tests/ — vitest only runs co-located unit tests in src/.
		include: ["src/**/*.test.ts"],
	},
});
