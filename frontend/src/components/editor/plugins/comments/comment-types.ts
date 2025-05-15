import type { ReactNode } from "react";

export type CommentTypeId =
  | "formatting" // default
  | "preCommittee" // Pre-Committee Questions/Comments
  | "committee"; // Committee Questions/Comments

export interface CommentType {
  id: CommentTypeId;
  label: string;
  icon?: ReactNode;
  bg?: string; // Tailwind CSS background utility
}

export const COMMENT_TYPES: CommentType[] = [
  { id: "formatting", label: "Formatting", bg: "bg-gray-200" },
  { id: "preCommittee", label: "Pre-Committee", bg: "bg-yellow-200" },
  { id: "committee", label: "Committee", bg: "bg-indigo-200" },
];

export const COMMENT_TYPES_MAP: Record<CommentTypeId, CommentType> =
  Object.fromEntries(COMMENT_TYPES.map((t) => [t.id, t])) as Record<
    CommentTypeId,
    CommentType
  >;
