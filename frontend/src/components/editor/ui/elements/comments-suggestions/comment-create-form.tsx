"use client";

import * as React from "react";

import { type Value, nanoid } from "@udecode/plate";
import { getCommentKey, getDraftCommentKey } from "@udecode/plate-comments";
import { CommentsPlugin, useCommentId } from "@udecode/plate-comments/react";
import { useEditorRef, usePluginOption } from "@udecode/plate/react";

import { cn } from "@/lib/utils";
import {
  type TDiscussion,
  discussionPlugin,
} from "../../../plugins/comments/discussion-plugin";
import { userPlugin } from "../../../plugins/user-plugin";

import { CommentTypeId } from "../../../plugins/comments/comment-types";

import type { TComment } from "./comment";

// New shared component
import { CommentForm } from "./comment-form";

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

  const onAddComment = React.useCallback(
    async (commentValue: Value, selectedType: CommentTypeId) => {
      // Clear editor value
      // (Clearing handled in CommentForm)

      if (discussionId) {
        // Get existing discussion
        const discussion = discussions.find((d) => d.id === discussionId);
        if (!discussion) {
          // Mock creating suggestion
          const newDiscussion: TDiscussion = {
            id: discussionId,
            comments: [
              {
                id: nanoid(),
                contentRich: commentValue,
                createdAt: new Date(),
                discussionId,
                isEdited: false,
                userId: editor.getOption(userPlugin, "currentUserId")!,
                commentType: selectedType,
              },
            ],
            createdAt: new Date(),
            isResolved: false,
            userId: editor.getOption(userPlugin, "currentUserId")!,
          };

          editor.setOption(discussionPlugin, "discussions", [
            ...discussions,
            newDiscussion,
          ]);
          return;
        }

        // Create reply comment
        const comment: TComment = {
          id: nanoid(),
          contentRich: commentValue,
          createdAt: new Date(),
          discussionId,
          isEdited: false,
          userId: editor.getOption(userPlugin, "currentUserId")!,
          commentType: selectedType,
        };

        // Add reply to discussion comments
        const updatedDiscussion = {
          ...discussion,
          comments: [...discussion.comments, comment],
        };

        // Filter out old discussion and add updated one
        const updatedDiscussions = discussions
          .filter((d) => d.id !== discussionId)
          .concat(updatedDiscussion);

        editor.setOption(discussionPlugin, "discussions", updatedDiscussions);

        return;
      }

      const commentsNodeEntry = editor
        .getApi(CommentsPlugin)
        .comment.nodes({ at: [], isDraft: true });

      if (commentsNodeEntry.length === 0) return;

      const documentContent = commentsNodeEntry
        .map(([node]) => node.text)
        .join("");

      const _discussionId = nanoid();
      // Mock creating new discussion
      const newDiscussion: TDiscussion = {
        id: _discussionId,
        comments: [
          {
            id: nanoid(),
            contentRich: commentValue,
            createdAt: new Date(),
            discussionId: _discussionId,
            isEdited: false,
            userId: editor.getOption(userPlugin, "currentUserId")!,
            commentType: selectedType,
          },
        ],
        createdAt: new Date(),
        documentContent,
        isResolved: false,
        userId: editor.getOption(userPlugin, "currentUserId")!,
      };

      editor.setOption(discussionPlugin, "discussions", [
        ...discussions,
        newDiscussion,
      ]);

      const id = newDiscussion.id;

      commentsNodeEntry.forEach(([, path]) => {
        editor.tf.setNodes(
          {
            [getCommentKey(id)]: true,
          },
          { at: path, split: true },
        );
        editor.tf.unsetNodes([getDraftCommentKey()], { at: path });
      });
    },
    [discussionId, editor, discussions],
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
