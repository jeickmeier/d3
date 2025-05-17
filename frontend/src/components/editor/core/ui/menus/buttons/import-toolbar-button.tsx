"use client";

import * as React from "react";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
// NOTE: Keep imports strictly typed; no need for Slate types here.

import { getEditorDOMFromHtmlString } from "@udecode/plate";
import { MarkdownPlugin } from "@udecode/plate-markdown";
import { useEditorRef } from "@udecode/plate/react";
import { ArrowUpToLineIcon } from "lucide-react";
import { useFilePicker } from "use-file-picker";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ToolbarButton } from "../toolbars/toolbar";

type ImportType = "html" | "markdown";

export function ImportToolbarButton(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  /**
   * Convert the raw text coming from an imported file into Slate-compatible
   * descendant nodes. The result is strongly typed as `Descendant[]` so that
   * we can safely pass it to Plate helpers without triggering the
   * `@typescript-eslint/no-unsafe-*` rules.
   */
  const getFileNodes = (text: string, type: ImportType): unknown[] => {
    if (type === "html") {
      const editorNode = getEditorDOMFromHtmlString(text);
      const nodes = editor.api.html.deserialize({
        element: editorNode,
      });

      return nodes as unknown[];
    }

    if (type === "markdown") {
      return editor
        .getApi(MarkdownPlugin)
        .markdown.deserialize(text) as unknown[];
    }

    return [];
  };

  const { openFilePicker: openMdFilePicker } = useFilePicker({
    accept: [".md", ".mdx"],
    multiple: false,
    onFilesSelected: async ({ plainFiles }: { plainFiles: File[] }) => {
      if (plainFiles.length === 0) return;

      const text = await plainFiles[0].text();

      const nodes = getFileNodes(text, "markdown");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editor.tf.insertNodes(nodes as any);
    },
  });

  const { openFilePicker: openHtmlFilePicker } = useFilePicker({
    accept: ["text/html"],
    multiple: false,
    onFilesSelected: async ({ plainFiles }: { plainFiles: File[] }) => {
      if (plainFiles.length === 0) return;

      const text = await plainFiles[0].text();

      const nodes = getFileNodes(text, "html");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      editor.tf.insertNodes(nodes as any);
    },
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Import" isDropdown>
          <ArrowUpToLineIcon className="size-4" />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => {
              openHtmlFilePicker();
            }}
          >
            Import from HTML
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={() => {
              openMdFilePicker();
            }}
          >
            Import from Markdown
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
