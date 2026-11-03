import { afterEach, describe, expect, it, vi } from "vitest";

describe("sanityClient", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("reads only published documents, even with a read token on an older API version", async () => {
    vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", "test-project");
    vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", "production");
    vi.stubEnv("SANITY_API_VERSION", "2025-01-01");
    vi.stubEnv("SANITY_READ_TOKEN", "test-token");

    const { sanityClient } = await import("@/lib/sanity/client");

    expect(sanityClient).not.toBeNull();
    expect(sanityClient?.config().perspective).toBe("published");
  });
});
