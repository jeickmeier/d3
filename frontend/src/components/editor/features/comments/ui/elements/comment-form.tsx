"use client";

import * as React from "react";
import { usePersistentState } from "@/hooks/usePersistentState";

import { NodeApi, type Value } from "@udecode/plate";
import { ArrowUpIcon } from "lucide-react";

import { CommentAvatar } from "@/components/ui/comment-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MiniPlateEditor } from "@/components/editor/plate-editor";

// Select dropdown for comment types
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Comment type definitions
import { COMMENT_TYPES, CommentTypeId } from "@comments/types/comment-types";

/**
 * Comment-Form
 * -------------
 * Rich-text powered comment input used inside the editor's comment sidebars and threads.
 *
 * The component combines three UI concerns:
 *   1. An (optional) avatar shown on the left so threads can be rendered in a chat-like
 *      layout.
 *   2. A `<Select>` control that lets the user decide which *type* of comment they are
 *      creating (e.g. "formatting", "content", …). The selected value is persisted via
 *      `usePersistentState()` so that the next time the user opens the form their last
 *      choice is pre-selected.
 *   3. A `MiniPlateEditor` instance that provides rich-text capabilities (bold, italic,
 *      etc.) inside the comment box.  The editor is intentionally *mini* – only the
 *      essentials are enabled – to keep the comment UI compact.
 *
 * Pressing ⏎ *without* <kbd>Shift</kbd> or clicking the send button submits the form
 * through the `onSubmit` callback.  Empty comments are ignored.  After a successful
 * submit the editor is cleared but the comment *type* is **not** reset so that users
 * can quickly create several comments of the same kind.
 *
 * Props are strongly typed through the `CommentFormProps` interface below and already
 * contain inline JSDoc for every field.
 */

interface CommentFormProps {
  /**
   * Submit callback returning the rich value and the selected comment type.
   */
  onSubmit: (value: Value, type: CommentTypeId) => void;
  /** Auto-focus the editor */
  autoFocus?: boolean;
  /** Extra wrapper classes */
  className?: string;
  /** Show the comment type selector */
  showTypeSelector?: boolean;
  /** Default / initial type */
  defaultType?: CommentTypeId;
  /** Placeholder text for the editor */
  placeholder?: string;
  /** Label for the submit button (icon-only if omitted) */
  submitLabel?: string;
  /** Hide the avatar shown on the left */
  hideAvatar?: boolean;
  /** Supply user info for avatar */
  user?: { name?: string | null; avatarUrl?: string | null } | null;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  autoFocus = false,
  className,
  showTypeSelector = true,
  defaultType = "formatting",
  placeholder = "Reply…",
  submitLabel,
  hideAvatar = true,
  user,
}) => {
  // Track selected type and editor value
  const [selectedType, setSelectedType] = usePersistentState<CommentTypeId>(
    "lastCommentType",
    defaultType,
  );
  const [value, setValue] = React.useState<Value | undefined>();

  // Turn the current rich-text `Value` into plain text so we can
  // check whether the user actually entered *something*.  We can't rely
  // on `value.length` alone because Plate always keeps an empty paragraph
  // in its internal representation.
  const plainContent = React.useMemo(
    () => (value ? NodeApi.string({ children: value, type: "p" }) : ""),
    [value],
  );

  const handleSubmit = React.useCallback(() => {
    // Guard against empty submissions: abort if the editor has no
    // rich-text value *or* the plain-text representation is only
    // whitespace.
    if (!value || !plainContent.trim()) return;
    onSubmit(value, selectedType);
    // Reset
    setValue(undefined);
  }, [onSubmit, plainContent, selectedType, value]);

  return (
    <div className={cn("flex flex-col w-full gap-2", className)}>
      {!hideAvatar && (
        <div className="mt-2 shrink-0">
          <CommentAvatar name={user?.name} avatarUrl={user?.avatarUrl} />
        </div>
      )}

      {showTypeSelector && (
        <div className="mt-2 shrink-0">
          <Select
            value={selectedType}
            onValueChange={(val) => {
              const type = val as CommentTypeId;
              setSelectedType(type);
            }}
          >
            <SelectTrigger className="h-8 w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {COMMENT_TYPES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex grow flex-col gap-2">
        <MiniPlateEditor
          value={value}
          onChange={setValue}
          placeholder={placeholder}
          autoFocus={autoFocus}
          showToolbar
          className="min-h-[50px] pt-2"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />

        <div className="flex items-center justify-end">
          <Button
            size="icon"
            variant="ghost"
            disabled={plainContent.trim().length === 0}
            onClick={(e) => {
              e.stopPropagation();
              handleSubmit();
            }}
          >
            {submitLabel ? submitLabel : <ArrowUpIcon className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
