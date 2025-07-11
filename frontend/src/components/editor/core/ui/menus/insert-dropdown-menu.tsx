"use client";

import * as React from "react";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { CodeBlockPlugin } from "@udecode/plate-code-block/react";
import { ColumnItemPlugin, ColumnPlugin } from "@udecode/plate-layout/react";
import { DatePlugin } from "@udecode/plate-date/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { TocPlugin } from "@udecode/plate-heading/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { INDENT_LIST_KEYS, ListStyleType } from "@udecode/plate-indent-list";
import { LinkPlugin } from "@udecode/plate-link/react";
import {
  EquationPlugin,
  InlineEquationPlugin,
} from "@udecode/plate-math/react";
import { ImagePlugin, MediaEmbedPlugin } from "@udecode/plate-media/react";
import { TablePlugin } from "@udecode/plate-table/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import {
  type PlateEditor,
  ParagraphPlugin,
  useEditorRef,
} from "@udecode/plate/react";
import {
  CalendarIcon,
  ChevronRightIcon,
  Columns3Icon,
  FileCodeIcon,
  FilmIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PilcrowIcon,
  PlusIcon,
  QuoteIcon,
  RadicalIcon,
  SquareIcon,
  TableIcon,
  TableOfContentsIcon,
  LightbulbIcon,
} from "lucide-react";
import { CalloutPlugin } from "@udecode/plate-callout/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  insertBlock,
  insertInlineElement,
} from "@/components/editor/core/transforms";

import { ToolbarButton, ToolbarMenuGroup } from "./toolbars/toolbar";

type Group = {
  group: string;
  items: Item[];
};

interface Item {
  icon: React.ReactNode;
  value: string;
  onSelect: (editor: PlateEditor, value: string) => void;
  focusEditor?: boolean;
  label?: string;
}

const groups: Group[] = [
  {
    group: "Basic blocks",
    items: [
      {
        icon: <PilcrowIcon />,
        label: "Paragraph",
        value: ParagraphPlugin.key,
      },
      {
        icon: <Heading1Icon />,
        label: "Heading 1",
        value: HEADING_KEYS.h1,
      },
      {
        icon: <Heading2Icon />,
        label: "Heading 2",
        value: HEADING_KEYS.h2,
      },
      {
        icon: <Heading3Icon />,
        label: "Heading 3",
        value: HEADING_KEYS.h3,
      },
      {
        icon: <TableIcon />,
        label: "Table",
        value: TablePlugin.key,
      },
      {
        icon: <FileCodeIcon />,
        label: "Code",
        value: CodeBlockPlugin.key,
      },
      {
        icon: <QuoteIcon />,
        label: "Quote",
        value: BlockquotePlugin.key,
      },
      {
        icon: <LightbulbIcon />,
        label: "Callout",
        value: CalloutPlugin.key,
      },
      {
        icon: <MinusIcon />,
        label: "Divider",
        value: HorizontalRulePlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: "Lists",
    items: [
      {
        icon: <ListIcon />,
        label: "Bulleted list",
        value: ListStyleType.Disc,
      },
      {
        icon: <ListOrderedIcon />,
        label: "Numbered list",
        value: ListStyleType.Decimal,
      },
      {
        icon: <SquareIcon />,
        label: "To-do list",
        value: INDENT_LIST_KEYS.todo,
      },
      {
        icon: <ChevronRightIcon />,
        label: "Toggle list",
        value: TogglePlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: "Media",
    items: [
      {
        icon: <ImageIcon />,
        label: "Image",
        value: ImagePlugin.key,
        onSelect: (editor, value) => {
          insertBlock(editor, value);
        },
      },
      {
        icon: <FilmIcon />,
        label: "Embed",
        value: MediaEmbedPlugin.key,
        onSelect: (editor, value) => {
          insertBlock(editor, value);
        },
      },
      {
        icon: <RadicalIcon />,
        label: "Equation",
        value: EquationPlugin.key,
        onSelect: (editor, value) => {
          insertBlock(editor, value);
        },
      },
      {
        icon: <Columns3Icon />,
        label: "Columns",
        value: "columns",
        onSelect: (editor) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
          (editor.commands as any).insertEmptyElement(
            editor.getType(ColumnPlugin),
            {
              type: editor.getType(ColumnPlugin),
              children: [
                {
                  type: editor.getType(ColumnItemPlugin),
                  children: [
                    {
                      type: editor.getType(ParagraphPlugin),
                      children: [{ text: "" }],
                    },
                  ],
                },
                {
                  type: editor.getType(ColumnItemPlugin),
                  children: [
                    {
                      type: editor.getType(ParagraphPlugin),
                      children: [{ text: "" }],
                    },
                  ],
                },
              ],
            },
          );
        },
      },
    ],
  },
  {
    group: "Advanced blocks",
    items: [
      {
        icon: <TableOfContentsIcon />,
        label: "Table of contents",
        value: TocPlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertBlock(editor, value);
      },
    })),
  },
  {
    group: "Inline",
    items: [
      {
        icon: <Link2Icon />,
        label: "Link",
        value: LinkPlugin.key,
      },
      {
        focusEditor: true,
        icon: <CalendarIcon />,
        label: "Date",
        value: DatePlugin.key,
      },
      {
        focusEditor: false,
        icon: <RadicalIcon />,
        label: "Inline Equation",
        value: InlineEquationPlugin.key,
      },
    ].map((item) => ({
      ...item,
      onSelect: (editor, value) => {
        insertInlineElement(editor, value);
      },
    })),
  },
];

export function InsertDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Insert" isDropdown>
          <PlusIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="flex max-h-[500px] min-w-0 flex-col overflow-y-auto"
        align="start"
      >
        {groups.map(({ group, items: nestedItems }) => (
          <ToolbarMenuGroup key={group} label={group}>
            {nestedItems.map(({ icon, label, value, onSelect }) => (
              <DropdownMenuItem
                key={value}
                className="min-w-[180px]"
                onSelect={() => {
                  onSelect(editor, value);
                  editor.tf.focus();
                }}
              >
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </ToolbarMenuGroup>
        ))}

        {/* Additional tools removed - handled in More dropdown */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
