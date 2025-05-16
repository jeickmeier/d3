"use client";

import emojiMartData from "@emoji-mart/data";
import { CalloutPlugin } from "@udecode/plate-callout/react";
import { CodeBlockPlugin } from "@udecode/plate-code-block/react";
import { DatePlugin } from "@udecode/plate-date/react";
import { DocxPlugin } from "@udecode/plate-docx";
import { EmojiPlugin } from "@udecode/plate-emoji/react";
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
  FontSizePlugin,
} from "@udecode/plate-font/react";
import { HighlightPlugin } from "@udecode/plate-highlight/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { JuicePlugin } from "@udecode/plate-juice";
import { KbdPlugin } from "@udecode/plate-kbd/react";
import { ColumnPlugin } from "@udecode/plate-layout/react";
import { SlashPlugin } from "@udecode/plate-slash-command/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import { TrailingBlockPlugin } from "@udecode/plate-trailing-block";

import { FixedToolbarPlugin } from "@/components/editor/core/plugins/fixed-toolbar-plugin";
import { FloatingToolbarPlugin } from "@/components/editor/core/plugins/floating-toolbar-plugin";

import { aiPlugins } from "@/components/editor/features/ai/plugins/ai-plugins";
import { alignPlugin } from "@/components/editor/core/plugins/align-plugin";
import { autoformatPlugin } from "@/components/editor/core/plugins/autoformat-plugin";
import { basicNodesPlugins } from "@/components/editor/core/plugins/basic-nodes-plugins";
import { blockMenuPlugins } from "@/components/editor/core/plugins/block-menu-plugins";
import { commentsPlugin } from "@comments/plugins/comments-plugin";
import { cursorOverlayPlugin } from "@/components/editor/core/plugins/cursor-overlay-plugin";
import { deletePlugins } from "@/components/editor/core/plugins/delete-plugins";
import { discussionPlugin } from "@comments/plugins/discussion-plugin";
import { dndPlugins } from "@/components/editor/core/plugins/dnd-plugins";
import { equationPlugins } from "@/components/editor/core/plugins/equation-plugins";
import { exitBreakPlugin } from "@/components/editor/core/plugins/exit-break-plugin";
import { indentListPlugins } from "@/components/editor/core/plugins/indent-list-plugins";
import { lineHeightPlugin } from "@/components/editor/core/plugins/line-height-plugin";
import { linkPlugin } from "@/components/editor/core/plugins/link-plugin";
import { markdownPlugin } from "@/components/editor/core/plugins/markdown-plugin";
import { mediaPlugins } from "@/components/editor/core/plugins/media-plugins";
import { mentionPlugin } from "@/components/editor/core/plugins/mention-plugin";
import { resetBlockTypePlugin } from "@/components/editor/core/plugins/reset-block-type-plugin";
import { skipMarkPlugin } from "@/components/editor/core/plugins/skip-mark-plugin";
import { softBreakPlugin } from "@/components/editor/core/plugins/soft-break-plugin";
import { tablePlugin } from "@/components/editor/core/plugins/table-plugin";
import { tocPlugin } from "@/components/editor/core/plugins/toc-plugin";
import { userPlugin } from "@/components/editor/core/plugins/user-plugin";

export const viewPlugins = [
  ...basicNodesPlugins,
  HorizontalRulePlugin,
  linkPlugin,
  DatePlugin,
  mentionPlugin,
  tablePlugin,
  TogglePlugin,
  tocPlugin,
  ...mediaPlugins,
  ...equationPlugins,
  CalloutPlugin,
  ColumnPlugin,

  // Marks
  FontColorPlugin,
  FontBackgroundColorPlugin,
  FontSizePlugin,
  HighlightPlugin,
  KbdPlugin,
  skipMarkPlugin,

  // Block Style
  alignPlugin,
  ...indentListPlugins,
  lineHeightPlugin,

  // Collaboration
  userPlugin,
  discussionPlugin,
  commentsPlugin,
] as const;

export const editorPlugins = [
  // AI
  ...aiPlugins,

  // Nodes
  ...viewPlugins,

  // Functionality
  SlashPlugin.extend({
    options: {
      triggerQuery(editor) {
        return !editor.api.some({
          match: { type: editor.getType(CodeBlockPlugin) },
        });
      },
    },
  }),
  autoformatPlugin,
  cursorOverlayPlugin,
  ...blockMenuPlugins,
  ...dndPlugins,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  EmojiPlugin.configure({ options: { data: emojiMartData as any } }),
  exitBreakPlugin,
  resetBlockTypePlugin,
  ...deletePlugins,
  softBreakPlugin,
  TrailingBlockPlugin,

  // Deserialization
  DocxPlugin,
  markdownPlugin,
  JuicePlugin,

  // UI
  FixedToolbarPlugin,
  FloatingToolbarPlugin,
];
