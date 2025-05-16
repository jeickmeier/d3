"use client";

import * as React from "react";

import type { TCommentText } from "@udecode/plate-comments";
import type { PlateLeafProps } from "@udecode/plate/react";

import { getCommentCount } from "@udecode/plate-comments";
import {
  PlateLeaf,
  useEditorPlugin,
  usePluginOption,
} from "@udecode/plate/react";

import { cn } from "@/lib/utils";
import { commentsPlugin } from "@comments/plugins/comments-plugin";

export interface CommentLeafProps extends PlateLeafProps<TCommentText> {
  /**
   * When true (default) the leaf includes interactive behaviour (hover / active
   * highlighting and event handlers). When false, it renders a simplified
   * static appearance suitable for export or read-only contexts.
   */
  interactive?: boolean;
}

export function CommentLeaf({
  children,
  leaf,
  interactive = true,
  ...rest
}: CommentLeafProps) {
  // Always call hooks (React hook rules) but we will only use them in
  // interactive mode.
  const { api, setOption } = useEditorPlugin(commentsPlugin);
  const hoverId = usePluginOption(commentsPlugin, "hoverId");
  const activeId = usePluginOption(commentsPlugin, "activeId");

  const isOverlapping = getCommentCount(leaf) > 1;
  const currentId = api.comment.nodeId(leaf);
  const isActive = activeId === currentId;
  const isHover = hoverId === currentId;

  // ─────────────────────────────────────────────────────────────────────────────
  // Static mode – no interactive handlers, simpler styling
  // ─────────────────────────────────────────────────────────────────────────────
  if (!interactive) {
    return (
      <PlateLeaf
        {...(rest as PlateLeafProps<TCommentText>)}
        className="border-b-2 border-b-highlight/35 bg-highlight/15"
      >
        {children}
      </PlateLeaf>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Interactive mode (existing behaviour)
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <PlateLeaf
      {...(rest as PlateLeafProps<TCommentText>)}
      className={cn(
        "border-b-2 border-b-highlight/[.36] bg-highlight/[.13] transition-colors duration-200",
        (isHover || isActive) && "border-b-highlight bg-highlight/25",
        isOverlapping && "border-b-2 border-b-highlight/[.7] bg-highlight/25",
        (isHover || isActive) &&
          isOverlapping &&
          "border-b-highlight bg-highlight/45",
      )}
      attributes={{
        ...rest.attributes,
        onClick: () => setOption("activeId", currentId ?? null),
        onMouseEnter: () => setOption("hoverId", currentId ?? null),
        onMouseLeave: () => setOption("hoverId", null),
      }}
    >
      {children}
    </PlateLeaf>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Static / read-only alias – used in export or PDF generation where no
// interactive behaviour is wanted. This avoids repeating the
// `interactive={false}` prop at every call-site.
// ─────────────────────────────────────────────────────────────────────────────
export const CommentLeafStatic = (props: CommentLeafProps) => (
  <CommentLeaf {...props} interactive={false} />
);
CommentLeafStatic.displayName = "CommentLeafStatic";
