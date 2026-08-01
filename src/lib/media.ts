import { getCloudflareContext } from "@opennextjs/cloudflare";
import { limitsFor } from "@/lib/plans";

export async function getMediaBucket() {
  const { env } = await getCloudflareContext({ async: true });
  return env.MEDIA;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_BYTES = 8 * 1024 * 1024; // 8MB per photo

export function assertValidImage(file: File) {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    throw new Error("Only JPEG, PNG, or WebP images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be smaller than 8MB.");
  }
}

export function extensionFor(mimeType: string) {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

/** Tier-based photo limits, sourced from the shared plan config. */
export function photoLimitFor(tier: string) {
  return limitsFor(tier).photos;
}
