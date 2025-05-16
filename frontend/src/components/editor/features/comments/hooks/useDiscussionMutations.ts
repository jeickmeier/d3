import { useCallback } from "react";
import { useEditorRef, usePluginOption } from "@udecode/plate/react";
import type { Value } from "@udecode/plate";

import {
  discussionPlugin,
  type TDiscussion,
} from "@comments/plugins/discussion-plugin";
import { userPlugin } from "@components/editor/plugins/user-plugin";
import type { CommentTypeId } from "@comments/types/comment-types";
import {
  createDiscussion,
  addCommentToDiscussion,
  addDiscussion,
  updateCommentInDiscussions,
  deleteCommentFromDiscussions,
} from "@comments/utils/discussion-utils";
import type { TComment } from "@comments/ui/elements/comment";
import { nanoid } from "nanoid";

/**
 * Centralised helper hook that returns bound mutation helpers for manipulating
 * the `discussionPlugin.discussions` editor option. All components should call
 * these rather than duplicating the boiler-plate.
 */
export function useDiscussionMutations() {
  const editor = useEditorRef();
  const currentUserId: string | undefined = usePluginOption(
    userPlugin,
    "currentUserId",
  );

  // ---------------------------------------------------------------------------
  // Add a brand-new discussion (document-level comment)
  // ---------------------------------------------------------------------------
  const addNewDiscussion = useCallback(
    (
      contentRich: Value,
      commentType: CommentTypeId,
      documentContent?: string,
    ): string | undefined => {
      if (!editor || !currentUserId) return undefined;

      const newDiscussion = createDiscussion({
        userId: currentUserId,
        commentType,
        contentRich,
        documentContent,
      });

      const discussions = (editor.getOption(discussionPlugin, "discussions") ??
        []) as TDiscussion[];

      editor.setOption(
        discussionPlugin,
        "discussions",
        addDiscussion(discussions, newDiscussion),
      );

      return newDiscussion.id;
    },
    [currentUserId, editor],
  );

  // ---------------------------------------------------------------------------
  // Add a reply comment to an existing discussion
  // ---------------------------------------------------------------------------
  const addReply = useCallback(
    (
      discussionId: string,
      contentRich: Value,
      commentType: CommentTypeId,
    ): string | undefined => {
      if (!editor || !currentUserId) return;

      const reply: TComment = {
        id: nanoid(),
        discussionId,
        contentRich,
        createdAt: new Date(),
        userId: currentUserId,
        isEdited: false,
        commentType,
      } as TComment;

      const discussions = (editor.getOption(discussionPlugin, "discussions") ??
        []) as TDiscussion[];

      editor.setOption(
        discussionPlugin,
        "discussions",
        addCommentToDiscussion(discussions, discussionId, reply),
      );

      return reply.id;
    },
    [currentUserId, editor],
  );

  // ---------------------------------------------------------------------------
  // Update an existing comment
  // ---------------------------------------------------------------------------
  const updateComment = useCallback(
    (commentId: string, discussionId: string, contentRich: Value) => {
      const discussions = (editor.getOption(discussionPlugin, "discussions") ??
        []) as TDiscussion[];
      editor.setOption(
        discussionPlugin,
        "discussions",
        updateCommentInDiscussions(
          discussions,
          commentId,
          discussionId,
          contentRich,
        ),
      );
    },
    [editor],
  );

  // ---------------------------------------------------------------------------
  // Delete a comment
  // ---------------------------------------------------------------------------
  const deleteComment = useCallback(
    (commentId: string, discussionId: string) => {
      const discussions = (editor.getOption(discussionPlugin, "discussions") ??
        []) as TDiscussion[];
      editor.setOption(
        discussionPlugin,
        "discussions",
        deleteCommentFromDiscussions(discussions, discussionId, commentId),
      );
    },
    [editor],
  );

  return {
    addNewDiscussion,
    addReply,
    updateComment,
    deleteComment,
  } as const;
}
