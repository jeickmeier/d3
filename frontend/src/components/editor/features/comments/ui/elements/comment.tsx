"use client";

import * as React from "react";

import type { Value } from "@udecode/plate";

import { usePluginOption } from "@udecode/plate/react";
import { formatCommentDate } from "@/lib/date";
import {
  CheckIcon,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
  XIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { userPlugin } from "@components/editor/core/plugins/user-plugin";
import type { CommentTypeId } from "@comments/types/comment-types";
import { COMMENT_TYPES_MAP } from "@comments/types/comment-types";
import { MiniPlateEditor } from "@/components/editor/plate-editor";
import { useDiscussionMutations } from "@comments/hooks/useDiscussionMutations";
import { CommentAvatar } from "@/components/ui/comment-avatar";

/**
 * Comment UI Components
 *
 * This file contains all React components required to render and interact with a
 * single discussion comment inside the rich-text editor. A comment can be shown
 * in read-only mode or – if the current user is the author – switched to an
 * inline editing mode backed by a `MiniPlateEditor`. Network mutations (update
 * and delete) are delegated to `useDiscussionMutations` which keeps data logic
 * out of the presentation layer.
 *
 * Exported members:
 *  • `TComment` – TypeScript interface describing the comment object shape.
 *  • `Comment` – Main visual component that renders a single comment row.
 *  • `CommentMoreDropdown` – Context menu providing edit / delete actions.
 *
 * Architectural notes:
 *  • The component relies on the Plate `userPlugin` to resolve user meta data
 *    (name, avatar) for the given `userId`.
 *  • `modal={false}` is used on the Radix `DropdownMenu` so that focus is not
 *    trapped and the surrounding editor keeps working as expected.
 *
 * IMPORTANT: Keep this block after the "use client" directive – the directive
 * must stay the very first statement so that Next.js treats the file as a
 * Client Component.
 */

/**
 * Comment entity shape consumed by the UI components in this file.
 */
export interface TComment {
  id: string;
  contentRich: Value;
  createdAt: Date;
  discussionId: string;
  isEdited: boolean;
  userId: string;
  commentType: CommentTypeId;
}

/**
 * Renders a single comment. When `enableEditing` is true and the current user
 * matches the comment author, the comment can be edited in-place or deleted via
 * a dropdown menu. The component also highlights the first comment in a thread
 * and optionally shows the document excerpt the discussion refers to.
 */
export function Comment(props: {
  comment: TComment;
  discussionLength: number;
  editingId: string | null;
  index: number;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
  documentContent?: string;
  showDocumentContent?: boolean;
  /** Disable editing capabilities (e.g., sidebar view). */
  enableEditing?: boolean;
}) {
  const {
    comment,
    discussionLength,
    documentContent,
    editingId,
    index,
    setEditingId,
    showDocumentContent = false,
    enableEditing = true,
  } = props;

  const userInfo = usePluginOption(userPlugin, "user", comment.userId);
  const currentUserId = usePluginOption(userPlugin, "currentUserId");

  const { updateComment: updateCommentMutation } = useDiscussionMutations();

  // Whether the comment belongs to the signed-in user – determines if edit &
  // delete actions should be shown.
  const isMyComment = currentUserId === comment.userId;

  // Keep the original value around so we can reset unsaved edits.
  const initialValue = comment.contentRich;

  // Local state for the Slate value while the comment is in edit mode.
  const [editingValue, setEditingValue] = React.useState<Value>(initialValue);

  // Sync editingValue whenever editing toggles on with fresh content
  React.useEffect(() => {
    if (editingId === comment.id) {
      setEditingValue(initialValue);
    }
  }, [editingId, initialValue]);

  const onCancel = () => {
    setEditingId(null);
    setEditingValue(initialValue);
  };

  const onSave = () => {
    void updateCommentMutation(comment.id, comment.discussionId, editingValue);
    setEditingId(null);
  };

  const isFirst = index === 0; // First comment of the discussion thread
  const isLast = index === discussionLength - 1; // Last comment of the thread
  const isEditing = editingId && editingId === comment.id;

  const [hovering, setHovering] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div className="relative flex items-center">
        <CommentAvatar name={userInfo?.name} avatarUrl={userInfo?.avatarUrl} />
        {/* Only show badge on first comment */}
        {index === 0 && (
          <span
            className={`ml-1 mr-2 px-1.5 py-[1px] text-[10px] font-medium rounded ${
              COMMENT_TYPES_MAP[comment.commentType ?? "formatting"].bg
            }`}
          >
            {COMMENT_TYPES_MAP[comment.commentType ?? "formatting"].label}
          </span>
        )}
        <h4 className="mx-2 text-sm leading-none font-semibold">
          {/* Replace to your own backend or refer to potion */}
          {userInfo?.name}
        </h4>

        <div className="text-xs leading-none text-muted-foreground/80">
          <span className="mr-1">
            {formatCommentDate(new Date(comment.createdAt))}
          </span>
          {comment.isEdited && <span>(edited)</span>}
        </div>

        {enableEditing && isMyComment && (hovering || dropdownOpen) && (
          <div className="absolute top-0 right-0 flex space-x-1">
            <CommentMoreDropdown
              comment={comment}
              dropdownOpen={dropdownOpen}
              setDropdownOpen={setDropdownOpen}
              setEditingId={setEditingId}
            />
          </div>
        )}
      </div>

      {isFirst && showDocumentContent && (
        <div className="text-subtle-foreground relative mt-1 flex pl-[32px] text-sm">
          {discussionLength > 1 && (
            <div className="absolute top-[5px] left-3 h-full w-0.5 shrink-0 bg-muted" />
          )}
          <div className="my-px w-0.5 shrink-0 bg-highlight" />
          {documentContent && <div className="ml-2">{documentContent}</div>}
        </div>
      )}

      <div className="relative my-1 pl-[26px]">
        {!isLast && (
          <div className="absolute top-0 left-3 h-full w-0.5 shrink-0 bg-muted" />
        )}
        {enableEditing && isEditing ? (
          <div className="flex w-full flex-col gap-2">
            <MiniPlateEditor
              value={editingValue}
              onChange={setEditingValue}
              showToolbar
              autoFocus
              className="min-h-[60px] grow"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSave();
                }
              }}
            />

            <div className="flex justify-end gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="size-[28px]"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  void onCancel();
                }}
              >
                <div className="flex size-5 shrink-0 items-center justify-center rounded-[50%] bg-primary/40">
                  <XIcon className="size-3 stroke-[3px] text-background" />
                </div>
              </Button>

              <Button
                size="icon"
                variant="ghost"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  void onSave();
                }}
              >
                <div className="flex size-5 shrink-0 items-center justify-center rounded-[50%] bg-brand">
                  <CheckIcon className="size-3 stroke-[3px] text-background" />
                </div>
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <MiniPlateEditor
              value={initialValue}
              readOnly
              className="min-w-full px-0"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Dropdown menu housing the "Edit" and "Delete" actions that is only shown for
 * the author's own comments. A ref is used to work around Radix' default focus
 * management so that focus is not forcefully returned to a button that may have
 * been unmounted after an action (e.g. switching into edit mode).
 */
interface CommentMoreDropdownProps {
  comment: TComment;
  dropdownOpen: boolean;
  setDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
}

export function CommentMoreDropdown(props: CommentMoreDropdownProps) {
  const { comment, dropdownOpen, setDropdownOpen, setEditingId } = props;

  const { deleteComment: deleteCommentMutation } = useDiscussionMutations();

  // Tracks whether the user has selected "Edit comment" so we can prevent
  // Radix from automatically returning focus to the trigger element when that
  // element might get unmounted afterwards.
  const selectedEditCommentRef = React.useRef<boolean>(false);

  const onEditComment = React.useCallback(() => {
    selectedEditCommentRef.current = true;

    if (!comment.id)
      return alert("You are operating too quickly, please try again later.");

    setEditingId(comment.id);
  }, [comment.id, setEditingId]);

  const onDeleteComment = React.useCallback(() => {
    if (!comment.id) {
      alert("You are operating too quickly, please try again later.");
      return;
    }
    deleteCommentMutation(comment.id, comment.discussionId);
  }, [comment.id, comment.discussionId, deleteCommentMutation]);

  return (
    <DropdownMenu
      open={dropdownOpen}
      onOpenChange={setDropdownOpen}
      modal={false}
    >
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" className={cn("h-6 p-1 text-muted-foreground")}>
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48 z-[80]"
        onCloseAutoFocus={(e) => {
          // Prevent Radix from returning focus to trigger
          if (selectedEditCommentRef.current) {
            selectedEditCommentRef.current = false;
          }

          // Stop default focus handling to avoid errors when DOM nodes may be unmounted
          return e.preventDefault();
        }}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={onEditComment}>
            <PencilIcon className="size-4" />
            Edit comment
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onDeleteComment}>
            <TrashIcon className="size-4" />
            Delete comment
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
