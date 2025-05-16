"use client";

import * as React from "react";
import { usePersistentState } from "@/hooks/usePersistentState";

import { NodeApi, type Value } from "@udecode/plate";
import { ArrowUpIcon } from "lucide-react";

import { CommentAvatar } from "@/components/ui/comment-avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MiniPlateEditor } from "@/components/editor/MiniPlateEditor";

// Select dropdown for comment types
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Comment type definitions
import {
  COMMENT_TYPES,
  CommentTypeId,
} from "@/components/editor/plugins/comments/comment-types";

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
  hideAvatar = false,
  user,
}) => {
  // Track selected type and editor value
  const [selectedType, setSelectedType] = usePersistentState<CommentTypeId>(
    "lastCommentType",
    defaultType,
  );
  const [value, setValue] = React.useState<Value | undefined>();

  // Derive plain-text content for disabled / submit checks
  const plainContent = React.useMemo(
    () => (value ? NodeApi.string({ children: value, type: "p" }) : ""),
    [value],
  );

  const handleSubmit = React.useCallback(() => {
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
