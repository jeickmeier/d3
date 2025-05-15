import type { PlateEditor } from "@udecode/plate/react";
import { discussionPlugin } from "./discussion-plugin";
import type { CommentTypeId } from "./comment-types";

/**
 * Check if a given comment type is currently visible.
 */
export const isTypeVisible = (
  editor: PlateEditor,
  type: CommentTypeId,
): boolean => {
  const visibleTypes = editor.getOption(
    discussionPlugin,
    "visibleTypes",
  ) as CommentTypeId[];
  return visibleTypes.includes(type);
};

/**
 * Get only discussions containing at least one visible comment type.
 */
export const getVisibleDiscussions = (editor: PlateEditor) => {
  const discussions = editor.getOption(
    discussionPlugin,
    "discussions",
  ) as any[];
  const visibleTypes = editor.getOption(
    discussionPlugin,
    "visibleTypes",
  ) as CommentTypeId[];

  return discussions.filter((discussion) =>
    discussion.comments.some((c: any) =>
      visibleTypes.includes(c.commentType ?? "formatting"),
    ),
  );
};
