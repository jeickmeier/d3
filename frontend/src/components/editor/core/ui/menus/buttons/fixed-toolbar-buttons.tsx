"use client";

import * as React from "react";

import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { FontColorPlugin } from "@udecode/plate-font/react";
import { useEditorReadOnly } from "@udecode/plate/react";
import {
  BaselineIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  WandSparklesIcon,
  MessageSquareTextIcon,
} from "lucide-react";

import { MoreDropdownMenu } from "../../menus/more-dropdown-menu";

import { AIToolbarButton } from "./ai-toolbar-button";
import { AlignDropdownMenu } from "../../menus/align-dropdown-menu";
import { ColorDropdownMenu } from "../../primitives/color-picker/color-dropdown-menu";
import { useCommentsSidebar } from "@/components/editor/features/comments/CommentsSidebarContext";
import { FontSizeToolbarButton } from "./font-size-toolbar-button";
import { RedoToolbarButton, UndoToolbarButton } from "./history-toolbar-button";
import { InsertDropdownMenu } from "../../menus/insert-dropdown-menu";
import { LinkToolbarButton } from "./link-toolbar-button";
import { MarkToolbarButton } from "./mark-toolbar-button";
import { ModeDropdownMenu } from "../../menus/mode-dropdown-menu";
import { TableDropdownMenu } from "../../menus/table-dropdown-menu";
import { EmojiDropdownMenu } from "../../menus/emoji/emoji-dropdown-menu";
import { ToolbarGroup, ToolbarButton } from "../../menus/toolbars/toolbar";

export function FixedToolbarButtons() {
  const readOnly = useEditorReadOnly();
  const { setIsCommentsSidebarOpen } = useCommentsSidebar();

  return (
    <div className="flex w-full">
      {!readOnly && (
        <>
          <ToolbarGroup>
            <UndoToolbarButton />
            <RedoToolbarButton />
            <AIToolbarButton tooltip="AI commands">
              <WandSparklesIcon />
            </AIToolbarButton>
          </ToolbarGroup>

          <ToolbarGroup>
            <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (⌘+B)">
              <BoldIcon />
            </MarkToolbarButton>
            <MarkToolbarButton
              nodeType={ItalicPlugin.key}
              tooltip="Italic (⌘+I)"
            >
              <ItalicIcon />
            </MarkToolbarButton>
            <MarkToolbarButton
              nodeType={UnderlinePlugin.key}
              tooltip="Underline (⌘+U)"
            >
              <UnderlineIcon />
            </MarkToolbarButton>
            <LinkToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <InsertDropdownMenu />
            <FontSizeToolbarButton />
          </ToolbarGroup>

          <ToolbarGroup>
            <AlignDropdownMenu />
            <ColorDropdownMenu
              nodeType={FontColorPlugin.key}
              tooltip="Text color"
            >
              <BaselineIcon />
            </ColorDropdownMenu>
            <TableDropdownMenu />
            <EmojiDropdownMenu />
          </ToolbarGroup>

          <ToolbarGroup>
            <MoreDropdownMenu />
          </ToolbarGroup>
        </>
      )}

      <div className="grow" />

      <ToolbarGroup>
        <ToolbarButton
          onClick={() => setIsCommentsSidebarOpen(true)}
          onMouseDown={(e) => e.preventDefault()}
          tooltip="View Comments"
        >
          <MessageSquareTextIcon />
        </ToolbarButton>
        <ModeDropdownMenu />
      </ToolbarGroup>
    </div>
  );
}
