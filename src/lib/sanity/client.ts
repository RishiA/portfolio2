import { createClient } from "next-sanity";

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.SANITY_API_VERSION || "2025-01-01",
  useCdn: true
};

export const isSanityConfigured = Boolean(sanityConfig.projectId && sanityConfig.dataset);

export const sanityClient = isSanityConfigured
  ? createClient({
      ...sanityConfig,
      token: process.env.SANITY_READ_TOKEN
    })
  : null;
