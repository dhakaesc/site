/**
 * Photo roles.
 *
 * Roles used to be implied by ordering: photo 0 was the avatar, photo 1 the
 * cover, everything else the album. That meant deleting or re-uploading a
 * photo could silently swap someone's avatar. The `role` column makes it
 * explicit, and the helpers below still fall back to the old positional rule
 * so profiles uploaded before the column existed keep rendering the same way.
 */

export const PHOTO_ROLES = ["profile", "cover", "album"] as const;
export type PhotoRole = (typeof PHOTO_ROLES)[number];

/** Roles that only ever have one photo - uploading a new one replaces it. */
export const SINGLE_ROLES: PhotoRole[] = ["profile", "cover"];

export function isPhotoRole(value: unknown): value is PhotoRole {
  return typeof value === "string" && (PHOTO_ROLES as readonly string[]).includes(value);
}

type PhotoLike = { key: string; role?: string | null; position?: number | null };

function byPosition<T extends PhotoLike>(list: T[]) {
  return [...list].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

/** Avatar: the explicit one, else the first photo, so old rows still work. */
export function pickProfilePhoto<T extends PhotoLike>(list: T[]): T | undefined {
  return list.find((p) => p.role === "profile") ?? byPosition(list)[0];
}

/** Banner: the explicit one, else the second photo, else the avatar. */
export function pickCoverPhoto<T extends PhotoLike>(list: T[]): T | undefined {
  const explicit = list.find((p) => p.role === "cover");
  if (explicit) return explicit;
  const ordered = byPosition(list.filter((p) => p.role !== "profile"));
  return ordered[1] ?? ordered[0] ?? pickProfilePhoto(list);
}

/** Gallery photos, in order, excluding whatever is acting as avatar/cover. */
export function pickAlbumPhotos<T extends PhotoLike>(list: T[]): T[] {
  const hasExplicit = list.some((p) => p.role === "profile" || p.role === "cover");
  if (hasExplicit) return byPosition(list.filter((p) => (p.role ?? "album") === "album"));
  // Legacy rows carry no roles at all - keep showing every photo in the album
  // rather than hiding two of them the moment this code ships.
  return byPosition(list);
}
