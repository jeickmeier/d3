"use client";

import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Plate } from "@udecode/plate/react";
import type { Value } from "@udecode/plate";
import { type CreatePlateEditorOptions } from "@udecode/plate/react";
import type { PlateStaticProps } from "@udecode/plate";

import { useCreateEditor } from "@components/editor/core/use-create-editor";
import { MINI_EDITOR_PLUGINS } from "@components/editor/core/plugins/mini-preset";

import { FixedToolbar } from "@components/editor/core/ui/menus/toolbars/fixed/fixed-toolbar";
import { ToolbarGroup } from "@components/editor/core/ui/menus/toolbars/toolbar";
import { MarkToolbarButton } from "@components/editor/core/ui/menus/buttons/mark-toolbar-button";
import { BulletedIndentListToolbarButton } from "@components/editor/core/ui/menus/buttons/indent-list-toolbar-button";

import { BoldPlugin, ItalicPlugin } from "@udecode/plate-basic-marks/react";
import { BoldIcon, ItalicIcon } from "lucide-react";

import { MediaToolbarButton } from "@components/editor/core/ui/menus/buttons/media-toolbar-button";
import { TableDropdownMenu } from "@components/editor/core/ui/menus/table-dropdown-menu";
import { ImagePlugin } from "@udecode/plate-media/react";

import { SettingsDialog } from "@/components/editor/settings/settings";
import { CommentsSidebar } from "@components/editor/features/comments/ui/sidebars/CommentsSidebar";
import {
  Editor,
  EditorContainer,
} from "@components/editor/core/ui/primitives/editor";
import { EditorStatic } from "@components/editor/core/ui/primitives/editor-static";

export interface PlateEditorProps {
  value?: Value;
  onChange?: (value: Value) => void;
  readOnly?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  showToolbar?: boolean;
  showSettings?: boolean;
  showComments?: boolean;
  enableDnD?: boolean;
  preset?: "mini" | "full";
  plugins?: CreatePlateEditorOptions["plugins"];
  currentUser?: { id: string; name?: string; avatarUrl?: string };
  editorVariant?: "demo" | "comment";
}

export function PlateEditor({
  value,
  onChange,
  readOnly = false,
  placeholder,
  autoFocus,
  onKeyDown,
  onClick,
  className,
  showToolbar = false,
  showSettings = false,
  showComments = false,
  enableDnD = false,
  preset = "full",
  plugins,
  currentUser,
  editorVariant,
}: PlateEditorProps) {
  const finalPlugins =
    plugins ??
    (preset === "mini"
      ? (Array.from(
          MINI_EDITOR_PLUGINS,
        ) as unknown as CreatePlateEditorOptions["plugins"])
      : undefined);

  const editor = useCreateEditor({
    id:
      preset === "mini"
        ? readOnly
          ? "mini-static"
          : "mini-editor"
        : readOnly
          ? "static"
          : "editor",
    placeholders: preset === "mini" ? false : undefined,
    ...(finalPlugins ? { plugins: finalPlugins } : {}),
    value,
    readOnly,
    currentUser,
  });

  let content = (
    <Plate
      editor={editor}
      onChange={onChange ? ({ value }) => onChange(value) : undefined}
    >
      {!readOnly && showToolbar && preset === "mini" && (
        <FixedToolbar className="z-10">
          <ToolbarGroup>
            <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold (⌘+B)">
              <BoldIcon className="size-4" />
            </MarkToolbarButton>
            <MarkToolbarButton
              nodeType={ItalicPlugin.key}
              tooltip="Italic (⌘+I)"
            >
              <ItalicIcon className="size-4" />
            </MarkToolbarButton>
            <BulletedIndentListToolbarButton />
            <TableDropdownMenu />
            <MediaToolbarButton nodeType={ImagePlugin.key} />
          </ToolbarGroup>
        </FixedToolbar>
      )}

      {readOnly ? (
        <EditorStatic
          editor={editor}
          components={editor.components as PlateStaticProps["components"]}
          className={className}
          onClick={onClick}
        />
      ) : (
        <EditorContainer
          variant={editorVariant ?? (preset === "mini" ? "comment" : "demo")}
        >
          <Editor
            variant={editorVariant ?? (preset === "mini" ? "comment" : "demo")}
            className={className}
            placeholder={placeholder}
            autoFocus={autoFocus}
            onKeyDown={onKeyDown}
            onClick={onClick}
          />
        </EditorContainer>
      )}

      {showSettings && <SettingsDialog />}
      {showComments && <CommentsSidebar />}
    </Plate>
  );

  if (enableDnD) {
    content = <DndProvider backend={HTML5Backend}>{content}</DndProvider>;
  }

  return content;
}

// Legacy wrappers for backward compatibility
export const MiniPlateEditor = (props: Omit<PlateEditorProps, "preset">) => (
  <PlateEditor preset="mini" showToolbar {...props} />
);

export const FullPlateEditor = (props: Omit<PlateEditorProps, "preset">) => (
  <PlateEditor preset="full" enableDnD showSettings showComments {...props} />
);
