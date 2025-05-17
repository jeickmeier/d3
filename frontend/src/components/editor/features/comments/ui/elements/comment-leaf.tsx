"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Comment-Leaf – custom Plate leaf renderer for comment anchors
// ─────────────────────────────────────────────────────────────────────────────
/**
 * CommentLeaf is a custom leaf renderer used by the Plate editor's comment
 * plugin.  It visually marks text ranges that are associated with one or more
 * comments and, in interactive mode, wires up mouse events so that the rest of
 * the editor UI can react to user intent (hovering or selecting a comment).
 *
 * Two operating modes are supported:
 * 1. Interactive **(default)** – adds event handlers that update the comment
 *    plugin's `hoverId` and `activeId` options so that sidebars, pop-overs, etc.
 *    can highlight the corresponding thread.
 * 2. Static – renders the same visual appearance **without** any client-side
 *    event handlers.  This is useful for read-only contexts such as PDF export
 *    or server-side rendering where React events are stripped out.
 */

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

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Props accepted by {@link CommentLeaf}. Extends the default PlateLeafProps for
 * a {@link TCommentText} node and introduces the `interactive` flag used to
 * toggle event handling.
 */
export interface CommentLeafProps extends PlateLeafProps<TCommentText> {
  /**
   * When true (default) the leaf includes interactive behaviour (hover / active
   * highlighting and event handlers). When false, it renders a simplified
   * static appearance suitable for export or read-only contexts.
   */
  interactive?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Comment-Leaf – custom Plate leaf renderer for comment anchors
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Render a Plate leaf node that represents a comment anchor.
 *
 * Visual cues
 * ────────────
 * • Base style – subtle background + underline to indicate a comment.
 * • Hover / Active – stronger highlight when the user hovers the anchor or the
 *   corresponding thread is selected in the sidebar.
 * • Overlap – if multiple comments target the same text, the underline becomes
 *   thicker / more opaque to communicate density.
 *
 * Behaviour (interactive mode only)
 * ─────────────────────────────────
 * • `onClick`       → sets `activeId` so the sidebar opens the thread.
 * • `onMouseEnter` → sets `hoverId` so other UI elements can react.
 * • `onMouseLeave` → clears `hoverId`.
 */
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
// Static helper – non-interactive alias
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Convenience wrapper that renders {@link CommentLeaf} with
 * `interactive={false}`.  Useful for read-only/export surfaces to avoid
 * repeating the prop every time.
 */
export const CommentLeafStatic = (props: CommentLeafProps) => (
  <CommentLeaf {...props} interactive={false} />
);
CommentLeafStatic.displayName = "CommentLeafStatic";
