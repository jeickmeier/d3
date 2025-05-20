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
      // ---------------------------------------------------------------------
      // 1. Reply to an existing discussion (discussionId is known *and* exists)
      // ---------------------------------------------------------------------
      if (discussionId && discussions.some((d) => d.id === discussionId)) {
        addReply(discussionId, commentValue, selectedType);
        return;
      }

      // ---------------------------------------------------------------------
      // 2. Draft selection present → create a new discussion anchored to text
      // ---------------------------------------------------------------------
      const draftNodes = editor
        .getApi(CommentsPlugin)
        .comment.nodes({ at: [], isDraft: true });

      if (draftNodes.length > 0) {
        const documentContent = draftNodes.map(([node]) => node.text).join("");

        const newDiscussionId = addNewDiscussion(
          commentValue,
          selectedType,
          documentContent,
        );

        if (!newDiscussionId) return;

        draftNodes.forEach(([, path]) => {
          editor.tf.setNodes(
            {
              // Plate's comment plugin requires both the generic "comment"
              // flag *and* the specific id-based key so that
              // `isCommentText` and related helpers recognise the leaf.
              [CommentsPlugin.key]: true,
              [getCommentKey(newDiscussionId)]: true,
            },
            { at: path, split: true },
          );
          editor.tf.unsetNodes([getDraftCommentKey()], { at: path });
        });

        return;
      }

      // ---------------------------------------------------------------------
      // 3. No draft nodes → document-level (unanchored) discussion
      // ---------------------------------------------------------------------
      addNewDiscussion(commentValue, selectedType);
    },
    [discussionId, discussions, addReply, editor, addNewDiscussion],
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
