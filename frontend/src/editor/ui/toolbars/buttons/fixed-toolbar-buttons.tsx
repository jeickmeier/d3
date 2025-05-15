"use client";

import * as React from "react";

import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
} from "@udecode/plate-font/react";
import { ImagePlugin } from "@udecode/plate-media/react";
import { useEditorReadOnly } from "@udecode/plate/react";
import {
  BaselineIcon,
  BoldIcon,
  ItalicIcon,
  PaintBucketIcon,
  UnderlineIcon,
  WandSparklesIcon,
} from "lucide-react";

import { MoreDropdownMenu } from "@/components/editor/ui/toolbars/more-dropdown-menu";

import { AIToolbarButton } from "@/components/editor/ui/toolbars/buttons/ai-toolbar-button";
import { AlignDropdownMenu } from "@/components/editor/ui/toolbars/buttons/align-dropdown-menu";
import { ColorDropdownMenu } from "@/components/editor/ui/common/color-picker/color-dropdown-menu";
import { CommentToolbarButton } from "@/components/editor/ui/toolbars/buttons/comment-toolbar-button";
import { FontSizeToolbarButton } from "@/components/editor/ui/toolbars/buttons/font-size-toolbar-button";
import {
  RedoToolbarButton,
  UndoToolbarButton,
} from "@/components/editor/ui/toolbars/buttons/history-toolbar-button";
import { InsertDropdownMenu } from "@/components/editor/ui/toolbars/insert-dropdown-menu";
import { LinkToolbarButton } from "@/components/editor/ui/toolbars/buttons/link-toolbar-button";
import { MarkToolbarButton } from "@/components/editor/ui/toolbars/buttons/mark-toolbar-button";
import { MediaToolbarButton } from "@/components/editor/ui/toolbars/buttons/media-toolbar-button";
import { ModeDropdownMenu } from "@/components/editor/ui/toolbars/buttons/mode-dropdown-menu";
import { TableDropdownMenu } from "@/components/editor/ui/toolbars/buttons/table-dropdown-menu";
import { ToolbarGroup } from "@/components/editor/ui/toolbars/toolbar";

export function FixedToolbarButtons() {
  const readOnly = useEditorReadOnly();

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
            <ColorDropdownMenu
              nodeType={FontBackgroundColorPlugin.key}
              tooltip="Background color"
            >
              <PaintBucketIcon />
            </ColorDropdownMenu>
            <TableDropdownMenu />
            <MediaToolbarButton nodeType={ImagePlugin.key} />
          </ToolbarGroup>

          <ToolbarGroup>
            <MoreDropdownMenu />
          </ToolbarGroup>
        </>
      )}

      <div className="grow" />

      <ToolbarGroup>
        <CommentToolbarButton />
        <ModeDropdownMenu />
      </ToolbarGroup>
    </div>
  );
}
