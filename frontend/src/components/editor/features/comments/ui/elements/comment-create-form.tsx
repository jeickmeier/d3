"use client";

import * as React from "react";

import type { Value } from "@udecode/plate";
import { getCommentKey, getDraftCommentKey } from "@udecode/plate-comments";
import { CommentsPlugin, useCommentId } from "@udecode/plate-comments/react";
import { useEditorRef, usePluginOption } from "@udecode/plate/react";

import { cn } from "@/lib/utils";
import { discussionPlugin } from "@comments/plugins/discussion-plugin";
import { userPlugin } from "@components/editor/core/plugins/user-plugin";

import { CommentTypeId } from "@comments/types/comment-types";

// New shared component
import { CommentForm } from "@comments/ui/elements/comment-form";

import { useDiscussionMutations } from "@comments/hooks/useDiscussionMutations";

export function CommentCreateForm({
  autoFocus = false,
  className,
  discussionId: discussionIdProp,
  showTypeSelector = true,
  defaultType = "formatting",
}: {
  autoFocus?: boolean;
  className?: string;
  discussionId?: string;
  showTypeSelector?: boolean;
  defaultType?: CommentTypeId;
}) {
  const discussions = usePluginOption(discussionPlugin, "discussions");

  const editor = useEditorRef();
  const commentId = useCommentId();
  const discussionId = discussionIdProp ?? commentId;

  const userInfo = usePluginOption(userPlugin, "currentUser");

  const { addNewDiscussion, addReply } = useDiscussionMutations();

  const onAddComment = React.useCallback(
    (commentValue: Value, selectedType: CommentTypeId) => {
      // If no discussionId prop is provided, always create a new discussion
      if (discussionIdProp === undefined) {
        addNewDiscussion(commentValue, selectedType);
        return;
      }
      // Clear editor value handled by CommentForm

      if (discussionId) {
        const discussionExists = discussions.some((d) => d.id === discussionId);
        if (!discussionExists) {
          // create a new discussion anchored to this id (coming from commentId)
          addNewDiscussion(commentValue, selectedType);
          return;
        }

        // add reply to existing discussion
        addReply(discussionId, commentValue, selectedType);
        return;
      }

      // New discussion (draft selection)
      const commentsNodeEntry = editor
        .getApi(CommentsPlugin)
        .comment.nodes({ at: [], isDraft: true });

      if (commentsNodeEntry.length === 0) return;

      const documentContent = commentsNodeEntry
        .map(([node]) => node.text)
        .join("");

      const newDiscussionId = addNewDiscussion(
        commentValue,
        selectedType,
        documentContent,
      );

      if (!newDiscussionId) return;

      commentsNodeEntry.forEach(([, path]) => {
        editor.tf.setNodes(
          {
            [getCommentKey(newDiscussionId)]: true,
          },
          { at: path, split: true },
        );
        editor.tf.unsetNodes([getDraftCommentKey()], { at: path });
      });
    },
    [
      discussionIdProp,
      discussionId,
      discussions,
      addNewDiscussion,
      addReply,
      editor,
    ],
  );

  return (
    <CommentForm
      onSubmit={onAddComment}
      autoFocus={autoFocus}
      className={cn("w-full", className)}
      showTypeSelector={showTypeSelector}
      defaultType={defaultType}
      user={{
        name: userInfo?.name ?? null,
        avatarUrl: userInfo?.avatarUrl ?? null,
      }}
    />
  );
}
