import * as React from "react";

import type { Value } from "@udecode/plate";
import { Plate } from "@udecode/plate/react";
import { BasicMarksPlugin } from "@udecode/plate-basic-marks/react";
import { HeadingPlugin } from "@udecode/plate-heading/react";
import { IndentListPlugin } from "@udecode/plate-indent-list/react";
import { IndentPlugin } from "@udecode/plate-indent/react";
import { ParagraphPlugin } from "@udecode/plate/react";

// Toolbar utilities (only used when !readOnly && showToolbar)
import { BoldPlugin, ItalicPlugin } from "@udecode/plate-basic-marks/react";
import { FixedToolbar } from "@/components/editor/core/ui/menus/toolbars/fixed/fixed-toolbar";
import { ToolbarGroup } from "@/components/editor/core/ui/menus/toolbars/toolbar";
import { MarkToolbarButton } from "@/components/editor/core/ui/menus/buttons/mark-toolbar-button";
import { BulletedIndentListToolbarButton } from "@/components/editor/core/ui/menus/buttons/indent-list-toolbar-button";
import { BoldIcon, ItalicIcon } from "lucide-react";

import { useCreateEditor } from "./core/use-create-editor";
import {
  Editor,
  EditorContainer,
} from "@/components/editor/core/ui/primitives/editor";
import { EditorStatic } from "@/components/editor/core/ui/primitives/editor-static";
import type { PlateStaticProps } from "@udecode/plate";
import type { CreatePlateEditorOptions } from "@udecode/plate/react";
import { mediaPlugins } from "@/components/editor/core/plugins/media-plugins";
import { tablePlugin } from "@/components/editor/core/plugins/table-plugin";
import { MediaToolbarButton } from "@/components/editor/core/ui/menus/buttons/media-toolbar-button";
import { TableDropdownMenu } from "@/components/editor/core/ui/menus/table-dropdown-menu";
import { ImagePlugin } from "@udecode/plate-media/react";

export const MINI_EDITOR_PLUGINS = [
  ParagraphPlugin,
  BasicMarksPlugin,
  HeadingPlugin.configure({ options: { levels: 3 } }),
  IndentPlugin,
  IndentListPlugin,
  ...mediaPlugins,
  tablePlugin,
] as const;

interface MiniPlateEditorProps {
  value?: Value;
  onChange?: (value: Value) => void;
  placeholder?: string;
  autoFocus?: boolean;
  readOnly?: boolean;
  showToolbar?: boolean;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  /** Optional click handler (useful for read-only mode). */
  onClick?: (e: React.MouseEvent) => void;
}

export const MiniPlateEditor: React.FC<MiniPlateEditorProps> = ({
  value = [],
  onChange,
  placeholder,
  autoFocus,
  readOnly = false,
  showToolbar = false,
  className,
  onKeyDown,
  onClick,
}) => {
  const editor = useCreateEditor({
    id: readOnly ? "mini-static" : "mini-editor",
    placeholders: false,
    plugins: [
      ...MINI_EDITOR_PLUGINS,
    ] as unknown as CreatePlateEditorOptions["plugins"],
    value,
    readOnly,
  });

  return (
    <Plate
      editor={editor}
      onChange={onChange ? ({ value }) => onChange(value) : undefined}
    >
      {!readOnly && showToolbar && (
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
        <EditorContainer variant="comment">
          <Editor
            variant="comment"
            className={className}
            placeholder={placeholder}
            autoFocus={autoFocus}
            onKeyDown={onKeyDown}
            onClick={onClick}
          />
        </EditorContainer>
      )}
    </Plate>
  );
};
