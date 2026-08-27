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

/**
 * Only formats every target browser can play natively. There is no
 * transcoding pipeline, so an unplayable upload stays unplayable forever -
 * rejecting it at the door is kinder than storing a file nobody can watch.
 * iPhone "HEVC .mov" is the common failure: it plays in Safari and shows a
 * black rectangle in Chrome.
 */
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"] as const;

/**
 * 50MB. The hard ceiling is Cloudflare's 100MB request body limit, and the
 * whole file passes through Worker memory (128MB) on its way to R2, so the
 * usable limit is well under that. Anything larger needs presigned
 * direct-to-R2 uploads that bypass the Worker entirely.
 */
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export function assertValidVideo(file: File) {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type as (typeof ALLOWED_VIDEO_TYPES)[number])) {
    throw new Error(
      "Only MP4 or WebM videos are supported. If this came from an iPhone, export it as MP4 first."
    );
  }
  if (file.size > MAX_VIDEO_BYTES) {
    throw new Error("Video must be smaller than 50MB.");
  }
  if (file.size === 0) {
    throw new Error("That file is empty.");
  }
}

export function videoExtensionFor(mimeType: string) {
  return mimeType === "video/webm" ? "webm" : "mp4";
}

/** Tier-based video limits, sourced from the shared plan config. */
export function videoLimitFor(tier: string) {
  return limitsFor(tier).videos;
}
