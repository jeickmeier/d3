import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  format,
} from "date-fns";

/**
 * Produces a compact relative timestamp similar to e.g. GitHub comments.
 *  • < 60 m  →  "Xm"
 *  • < 24 h  →  "Xh"
 *  • < 48 h  →  "Xd"
 *  • else    →  "MM/dd/yyyy"
 */
export function formatCommentDate(date: Date): string {
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);
  const diffHours = differenceInHours(now, date);
  const diffDays = differenceInDays(now, date);

  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 2) return `${diffDays}d`;
  return format(date, "MM/dd/yyyy");
}
