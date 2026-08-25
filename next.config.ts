import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		serverActions: {
			// Photo uploads in the admin go through server actions, and Next
			// caps their request body at 1MB by default — small enough that any
			// real phone or camera photo is rejected before our own 5MB check
			// runs. Sits just above that cap to leave room for the rest of the
			// form's fields and multipart encoding overhead.
			bodySizeLimit: "6mb",
		},
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
