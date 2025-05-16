"use client";

import * as React from "react";

import { withProps } from "@udecode/cn";
import { BaseParagraphPlugin, SlateLeaf } from "@udecode/plate";
import { useAIChatEditor } from "@udecode/plate-ai/react";
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from "@udecode/plate-basic-marks";
import { BaseBlockquotePlugin } from "@udecode/plate-block-quote";
import { BaseCalloutPlugin } from "@udecode/plate-callout";
import {
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodeSyntaxPlugin,
} from "@udecode/plate-code-block";
import { BaseDatePlugin } from "@udecode/plate-date";
import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontWeightPlugin,
} from "@udecode/plate-font";
import {
  BaseHeadingPlugin,
  BaseTocPlugin,
  HEADING_KEYS,
} from "@udecode/plate-heading";
import { BaseHighlightPlugin } from "@udecode/plate-highlight";
import { BaseHorizontalRulePlugin } from "@udecode/plate-horizontal-rule";
import { BaseIndentPlugin } from "@udecode/plate-indent";
import { BaseIndentListPlugin } from "@udecode/plate-indent-list";
import { BaseKbdPlugin } from "@udecode/plate-kbd";
import { BaseColumnItemPlugin, BaseColumnPlugin } from "@udecode/plate-layout";
import { BaseLinkPlugin } from "@udecode/plate-link";
import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
} from "@udecode/plate-math";
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseVideoPlugin,
} from "@udecode/plate-media";
import { BaseMentionPlugin } from "@udecode/plate-mention";
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from "@udecode/plate-table";
import { usePlateEditor } from "@udecode/plate/react";
import { all, createLowlight } from "lowlight";

import { markdownPlugin } from "@components/editor/core/plugins/markdown-plugin";
import {
  TodoLiStatic,
  TodoMarkerStatic,
} from "@components/editor/core/ui/elements/indentation/indent-todo-marker-static";

import { BlockquoteElementStatic } from "@components/editor/core/ui/elements/blockquote/blockquote-element-static";
import { CalloutElementStatic } from "@components/editor/core/ui/elements/callout/callout-element-static";
import { CodeBlockElementStatic } from "@components/editor/core/ui/elements/code/code-block-element-static";
import { CodeLeafStatic } from "@components/editor/core/ui/elements/code/code-leaf-static";
import { CodeLineElementStatic } from "@components/editor/core/ui/elements/code/code-line-element-static";
import { CodeSyntaxLeafStatic } from "@components/editor/core/ui/elements/code/code-syntax-leaf-static";
import { ColumnElementStatic } from "@components/editor/core/ui/elements/layout/column-element-static";
import { ColumnGroupElementStatic } from "@components/editor/core/ui/elements/layout/column-group-element-static";
import { DateElementStatic } from "@components/editor/core/ui/elements/date/date-element-static";
import { EditorStatic } from "@components/editor/core/ui/primitives/editor-static";
import { EquationElementStatic } from "@components/editor/core/ui/elements/equation/equation-element-static";
import { HeadingElementStatic } from "@components/editor/core/ui/elements/heading/heading-element-static";
import { HighlightLeafStatic } from "@components/editor/core/ui/elements/leafs/highlight-leaf-static";
import { HrElementStatic } from "@components/editor/core/ui/elements/heading/hr-element-static";
import { ImageElementStatic } from "@components/editor/core/ui/elements/image/image-element-static";
import { InlineEquationElementStatic } from "@components/editor/core/ui/elements/equation/inline-equation-element-static";
import { KbdLeafStatic } from "@components/editor/core/ui/elements/leafs/kbd-leaf-static";
import { LinkElementStatic } from "@components/editor/core/ui/elements/link/link-element-static";
import { MediaAudioElementStatic } from "@components/editor/core/ui/elements/media/media-audio-element-static";
import { MediaFileElementStatic } from "@components/editor/core/ui/elements/media/media-file-element-static";
import { MediaVideoElementStatic } from "@components/editor/core/ui/elements/media/media-video-element-static";
import { MentionElementStatic } from "@components/editor/core/ui/elements/mention/mention-element-static";
import { ParagraphElementStatic } from "@components/editor/core/ui/elements/paragraph/paragraph-element-static";
import {
  TableCellElementStatic,
  TableCellHeaderStaticElement,
} from "@components/editor/core/ui/elements/table/table-cell-element-static";
import { TableElementStatic } from "@components/editor/core/ui/elements/table/table-element-static";
import { TableRowElementStatic } from "@components/editor/core/ui/elements/table/table-row-element-static";
import { TocElementStatic } from "@components/editor/core/ui/elements/toc/toc-element-static";

const components = {
  [BaseAudioPlugin.key]: MediaAudioElementStatic,
  [BaseBlockquotePlugin.key]: BlockquoteElementStatic,
  [BaseBoldPlugin.key]: withProps(SlateLeaf, { as: "strong" }),
  [BaseCalloutPlugin.key]: CalloutElementStatic,
  [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
  [BaseCodeLinePlugin.key]: CodeLineElementStatic,
  [BaseCodePlugin.key]: CodeLeafStatic,
  [BaseCodeSyntaxPlugin.key]: CodeSyntaxLeafStatic,
  [BaseColumnItemPlugin.key]: ColumnElementStatic,
  [BaseColumnPlugin.key]: ColumnGroupElementStatic,
  [BaseDatePlugin.key]: DateElementStatic,
  [BaseEquationPlugin.key]: EquationElementStatic,
  [BaseFilePlugin.key]: MediaFileElementStatic,
  [BaseHighlightPlugin.key]: HighlightLeafStatic,
  [BaseHorizontalRulePlugin.key]: HrElementStatic,
  [BaseImagePlugin.key]: ImageElementStatic,
  [BaseInlineEquationPlugin.key]: InlineEquationElementStatic,
  [BaseItalicPlugin.key]: withProps(SlateLeaf, { as: "em" }),
  [BaseKbdPlugin.key]: KbdLeafStatic,
  [BaseLinkPlugin.key]: LinkElementStatic,
  [BaseMentionPlugin.key]: MentionElementStatic,
  [BaseParagraphPlugin.key]: ParagraphElementStatic,
  [BaseStrikethroughPlugin.key]: withProps(SlateLeaf, { as: "s" }),
  [BaseSubscriptPlugin.key]: withProps(SlateLeaf, { as: "sub" }),
  [BaseSuperscriptPlugin.key]: withProps(SlateLeaf, { as: "sup" }),
  [BaseTableCellHeaderPlugin.key]: TableCellHeaderStaticElement,
  [BaseTableCellPlugin.key]: TableCellElementStatic,
  [BaseTablePlugin.key]: TableElementStatic,
  [BaseTableRowPlugin.key]: TableRowElementStatic,
  [BaseTocPlugin.key]: TocElementStatic,
  [BaseUnderlinePlugin.key]: withProps(SlateLeaf, { as: "u" }),

  [BaseVideoPlugin.key]: MediaVideoElementStatic,
  [HEADING_KEYS.h1]: withProps(HeadingElementStatic, { variant: "h1" }),

  [HEADING_KEYS.h2]: withProps(HeadingElementStatic, { variant: "h2" }),
  [HEADING_KEYS.h3]: withProps(HeadingElementStatic, { variant: "h3" }),

  // [BaseCommentsPlugin.key]: CommentLeafStatic
  // [BaseTogglePlugin.key]: ToggleElementStatic
};
const lowlight = createLowlight(all);

const plugins = [
  BaseColumnItemPlugin,
  BaseColumnPlugin,
  BaseBlockquotePlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseImagePlugin,
  BaseKbdPlugin,
  BaseBoldPlugin,
  BaseCodeBlockPlugin.configure({ options: { lowlight } }),
  BaseDatePlugin,
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
  BaseFontColorPlugin,
  BaseFontSizePlugin,
  BaseFontFamilyPlugin,
  BaseFontWeightPlugin,
  BaseFontBackgroundColorPlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseTablePlugin,
  BaseTocPlugin,
  BaseHighlightPlugin,
  BaseLinkPlugin,
  BaseMentionPlugin,
  BaseParagraphPlugin,
  BaseCalloutPlugin,
  BaseIndentPlugin.extend({
    inject: {
      targetPlugins: [BaseParagraphPlugin.key],
    },
  }),
  BaseIndentListPlugin.extend({
    inject: {
      targetPlugins: [BaseParagraphPlugin.key],
    },
    options: {
      listStyleTypes: {
        todo: {
          liComponent: TodoLiStatic,
          markerComponent: TodoMarkerStatic,
          type: "todo",
        },
      },
    },
  }),
  markdownPlugin,
];

export const AIChatEditor = React.memo(function AIChatEditor({
  content,
}: {
  content: string;
}) {
  const aiEditor = usePlateEditor({
    plugins,
  });

  useAIChatEditor(aiEditor, content);

  return (
    <EditorStatic variant="aiChat" components={components} editor={aiEditor} />
  );
});
