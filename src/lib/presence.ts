/** A member counts as online if they've been active in the last 5 minutes. */
export const ONLINE_WINDOW_MS = 5 * 60 * 1000;

export function isOnline(lastSeenAt: Date | string | null | undefined) {
  if (!lastSeenAt) return false;
  const t = new Date(lastSeenAt).getTime();
  return Date.now() - t < ONLINE_WINDOW_MS;
}

/**
 * "Online now", "Active 5m ago", "Active 3h ago", "Active 2d ago".
 * Returns null when we've never seen them, so callers can hide the badge
 * rather than showing something misleading.
 */
export function presenceLabel(lastSeenAt: Date | string | null | undefined) {
  if (!lastSeenAt) return null;

  const diff = Date.now() - new Date(lastSeenAt).getTime();
  if (diff < ONLINE_WINDOW_MS) return "Online now";

  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `Active ${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Active ${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `Active ${days}d ago`;

  const months = Math.floor(days / 30);
  return `Active ${months}mo ago`;
}
