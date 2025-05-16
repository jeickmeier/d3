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
import { FixedToolbar } from "@/components/editor/ui/menus/toolbars/fixed/fixed-toolbar";
import { ToolbarGroup } from "@/components/editor/ui/menus/toolbars/toolbar";
import { MarkToolbarButton } from "@/components/editor/ui/menus/buttons/mark-toolbar-button";
import { BulletedIndentListToolbarButton } from "@/components/editor/ui/menus/buttons/indent-list-toolbar-button";
import { BoldIcon, ItalicIcon } from "lucide-react";

import { useCreateEditor } from "./core/use-create-editor";
import {
  Editor,
  EditorContainer,
} from "@/components/editor/ui/primitives/editor";
import { EditorStatic } from "@/components/editor/ui/primitives/editor-static";

export const MINI_EDITOR_PLUGINS = [
  ParagraphPlugin,
  BasicMarksPlugin,
  HeadingPlugin.configure({ options: { levels: 3 } }),
  IndentPlugin,
  IndentListPlugin,
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
    plugins: MINI_EDITOR_PLUGINS as any,
    value,
    readOnly,
  });

  return (
    <Plate
      editor={editor}
      onChange={onChange ? ({ value }) => onChange(value) : undefined}
    >
      {!readOnly && showToolbar && (
        <FixedToolbar>
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
          </ToolbarGroup>
        </FixedToolbar>
      )}

      {readOnly ? (
        <EditorStatic
          editor={editor as any}
          components={editor.components as any}
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
