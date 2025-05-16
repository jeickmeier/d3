import type { Value } from "@udecode/plate";
import { nanoid } from "nanoid";

import type { TComment } from "@comments/ui/elements/comment";
import type { TDiscussion } from "@comments/plugins/discussion-plugin";
import type { CommentTypeId } from "@comments/types/comment-types";

/**
 * Add a brand-new discussion containing a first comment.
 */
export function createDiscussion({
  userId,
  commentType,
  contentRich,
  documentContent,
}: {
  userId: string;
  commentType: CommentTypeId;
  contentRich: Value;
  documentContent?: string;
}): TDiscussion {
  const discussionId = nanoid();
  const commentId = nanoid();

  const newComment: TComment = {
    id: commentId,
    discussionId,
    contentRich,
    createdAt: new Date(),
    userId,
    isEdited: false,
    commentType,
  } as TComment;

  return {
    id: discussionId,
    comments: [newComment],
    createdAt: new Date(),
    isResolved: false,
    userId,
    documentContent,
  } as TDiscussion;
}

/**
 * Insert a discussion into the list.
 */
export const addDiscussion = (
  discussions: TDiscussion[],
  discussion: TDiscussion,
): TDiscussion[] => [...discussions, discussion];

/**
 * Add a reply comment to an existing discussion.
 */
export const addCommentToDiscussion = (
  discussions: TDiscussion[],
  discussionId: string,
  comment: TComment,
): TDiscussion[] =>
  discussions.map((d) =>
    d.id === discussionId ? { ...d, comments: [...d.comments, comment] } : d,
  );

/**
 * Update a comment (content / isEdited flag).
 */
export const updateCommentInDiscussions = (
  discussions: TDiscussion[],
  commentId: string,
  discussionId: string,
  contentRich: Value,
): TDiscussion[] =>
  discussions.map((d) => {
    if (d.id !== discussionId) return d;
    return {
      ...d,
      comments: d.comments.map((c) =>
        c.id === commentId
          ? {
              ...c,
              contentRich,
              isEdited: true,
              updatedAt: new Date(),
            }
          : c,
      ),
    };
  });

/**
 * Delete a comment from a discussion.
 */
export const deleteCommentFromDiscussions = (
  discussions: TDiscussion[],
  discussionId: string,
  commentId: string,
): TDiscussion[] =>
  discussions.map((d) => {
    if (d.id !== discussionId) return d;
    return {
      ...d,
      comments: d.comments.filter((c) => c.id !== commentId),
    };
  });

/**
 * Utility: return only discussions that contain at least one comment whose
 * `commentType` is part of the `visibleTypes` array.
 * Helps de-duplicating identical filter logic in sidebar & block popover.
 */
export const filterDiscussionsByTypes = (
  discussions: TDiscussion[],
  visibleTypes: CommentTypeId[],
): TDiscussion[] =>
  discussions.filter((d) =>
    d.comments.some((c) =>
      visibleTypes.includes(c.commentType ?? "formatting"),
    ),
  );
