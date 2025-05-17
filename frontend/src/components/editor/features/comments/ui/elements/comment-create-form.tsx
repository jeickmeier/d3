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

/**
 * CommentCreateForm
 * ------------------
 * React component responsible for rendering the rich-text comment composer that appears
 * underneath an editor selection or inside an existing discussion thread.
 *
 * High-level behaviour:
 * 1. Determines the discussion context:
 *    • If `discussionId` is supplied, we are replying to an existing discussion.
 *    • Otherwise, we either create a new discussion anchored to the current comment mark
 *      (coming from the `useCommentId()` helper) or – if the user is still in "draft"
 *      mode – generate a brand-new discussion based on the draft selection.
 * 2. Delegates actual persistence logic to `useDiscussionMutations()` which exposes
 *    `addNewDiscussion` and `addReply` helpers that talk to the backend.
 * 3. Renders a shared `CommentForm` UI component, passing the correct user profile,
 *    default type, and focus behaviour.
 *
 * Props:
 *  - autoFocus       : When true the textarea receives focus on mount.
 *  - className       : Optional Tailwind utilities to extend the component wrapper.
 *  - discussionId    : When provided, treats the composer as a reply box for that id.
 *  - showTypeSelector: Toggles the visibility of the comment-type dropdown.
 *  - defaultType     : Pre-selected value for the type selector (defaults to "formatting").
 */
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

  /**
   * Callback executed when the user submits the `CommentForm`.
   *
   * Control flow:
   * 1. If `discussionIdProp` is **undefined**, we are guaranteed to create a new
   *    discussion and can bail out early after invoking `addNewDiscussion`.
   * 2. If a `discussionId` is known, we check whether that discussion already
   *    exists in the `discussionPlugin` state:
   *      • NOT found ⇒ create a _new_ discussion anchored to the given id.
   *      • Found      ⇒ append a reply via `addReply`.
   * 3. When the user is commenting on a _draft_ selection (the temporary mark that
   *    appears before the comment is persisted) we need to:
   *      • Extract the text inside the draft nodes to use as the discussion title.
   *      • Persist the discussion via `addNewDiscussion` and capture the generated id.
   *      • Iterate over every draft mark and replace it with a permanent comment key
   *        (while simultaneously removing the draft flag).
   *
   * This rather involved routine guarantees that the Slate editor's internal state
   * stays in sync with the comment backend, irrespective of whether the user is
   * starting a brand-new discussion, replying, or promoting a draft comment to a
   * persisted discussion.
   */
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
