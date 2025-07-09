"use client";

import type { Value } from "@udecode/plate";

import { withProps } from "@udecode/cn";
import { AIChatPlugin, AIPlugin, CopilotPlugin } from "@udecode/plate-ai/react";
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { CalloutPlugin } from "@udecode/plate-callout/react";
import {
  CodeBlockPlugin,
  CodeLinePlugin,
  CodeSyntaxPlugin,
} from "@udecode/plate-code-block/react";
import { CommentsPlugin } from "@udecode/plate-comments/react";
import { DatePlugin } from "@udecode/plate-date/react";
import { EmojiInputPlugin } from "@udecode/plate-emoji/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { TocPlugin } from "@udecode/plate-heading/react";
import { HighlightPlugin } from "@udecode/plate-highlight/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { KbdPlugin } from "@udecode/plate-kbd/react";
import { ColumnItemPlugin, ColumnPlugin } from "@udecode/plate-layout/react";
import { LinkPlugin } from "@udecode/plate-link/react";
import {
  EquationPlugin,
  InlineEquationPlugin,
} from "@udecode/plate-math/react";
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from "@udecode/plate-media/react";
import {
  MentionInputPlugin,
  MentionPlugin,
} from "@udecode/plate-mention/react";
import { SlashInputPlugin } from "@udecode/plate-slash-command/react";
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from "@udecode/plate-table/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import {
  type CreatePlateEditorOptions,
  ParagraphPlugin,
  PlateLeaf,
  usePlateEditor,
} from "@udecode/plate/react";

import { AIAnchorElement } from "@/components/editor/features/ai/ui/elements/ai-anchor-element";
import { AILeaf } from "@/components/editor/features/ai/ui/elements/ai-leaf";
import { BlockquoteElement } from "@/components/editor/core/ui/elements/blockquote/blockquote-element";
import { CalloutElement } from "@/components/editor/core/ui/elements/callout/callout-element";
import { CodeBlockElement } from "@/components/editor/core/ui/elements/code/code-block-element";
import { CodeLeaf } from "@/components/editor/core/ui/elements/code/code-leaf";
import { CodeLineElement } from "@/components/editor/core/ui/elements/code/code-line-element";
import { CodeSyntaxLeaf } from "@/components/editor/core/ui/elements/code/code-syntax-leaf";
import { ColumnElement } from "@/components/editor/core/ui/elements/layout/column-element";
import { ColumnGroupElement } from "@/components/editor/core/ui/elements/layout/column-group-element";
import { CommentLeaf } from "@comments/ui/elements/comment-leaf";
import { DateElement } from "@/components/editor/core/ui/elements/date/date-element";
import { EmojiInputElement } from "@/components/editor/core/ui/menus/emoji/emoji-input-element";
import { EquationElement } from "@/components/editor/core/ui/elements/equation/equation-element";
import { HeadingElement } from "@/components/editor/core/ui/elements/heading/heading-element";
import { HighlightLeaf } from "@/components/editor/core/ui/elements/leafs/highlight-leaf";
import { HrElement } from "@/components/editor/core/ui/elements/heading/hr-element";
import { ImageElement } from "@/components/editor/core/ui/elements/image/image-element";
import { InlineEquationElement } from "@/components/editor/core/ui/elements/equation/inline-equation-element";
import { KbdLeaf } from "@/components/editor/core/ui/elements/leafs/kbd-leaf";
import { LinkElement } from "@/components/editor/core/ui/elements/link/link-element";
import { MediaAudioElement } from "@/components/editor/core/ui/elements/media/media-audio-element";
import { MediaEmbedElement } from "@/components/editor/core/ui/elements/media/media-embed-element";
import { MediaFileElement } from "@/components/editor/core/ui/elements/media/media-file-element";
import { MediaPlaceholderElement } from "@/components/editor/core/ui/elements/media/media-placeholder-element";
import { MediaVideoElement } from "@/components/editor/core/ui/elements/media/media-video-element";
import { MentionElement } from "@/components/editor/core/ui/elements/mention/mention-element";
import { MentionInputElement } from "@/components/editor/core/ui/elements/mention/mention-input-element";
import { ParagraphElement } from "@/components/editor/core/ui/elements/paragraph/paragraph-element";
import { withPlaceholders } from "@/components/editor/core/ui/primitives/placeholder";
import { SlashInputElement } from "@/components/editor/core/ui/elements/slash-input/slash-input-element";
import {
  TableCellElement,
  TableCellHeaderElement,
} from "@/components/editor/core/ui/elements/table/table-cell-element";
import { TableElement } from "@/components/editor/core/ui/elements/table/table-element";
import { TableRowElement } from "@/components/editor/core/ui/elements/table/table-row-element";
import { TocElement } from "@/components/editor/core/ui/elements/toc/toc-element";
import { ToggleElement } from "@/components/editor/core/ui/elements/toggle/toggle-element";

import { userPlugin } from "@/components/editor/core/plugins/user-plugin";
import { editorPlugins, viewPlugins } from "./editor-plugins";

// Define a more specific type for currentUser based on PlateEditorProps if available,
// or define it inline if PlateEditorProps is not directly accessible/relevant here.
// Assuming PlateEditorProps is defined in plate-editor.tsx and has a similar structure.
interface CurrentUserType {
  id: string;
  name?: string;
  avatarUrl?: string;
}

interface UseCreateEditorHookOptions
  extends Omit<CreatePlateEditorOptions, "plugins"> {
  placeholders?: boolean;
  plugins?: CreatePlateEditorOptions["plugins"];
  readOnly?: boolean;
  currentUser?: CurrentUserType;
}

export const viewComponents = {
  [AIChatPlugin.key]: AIAnchorElement,
  [AudioPlugin.key]: MediaAudioElement,
  [BlockquotePlugin.key]: BlockquoteElement,
  [BoldPlugin.key]: withProps(PlateLeaf, { as: "strong" }),
  [CalloutPlugin.key]: CalloutElement,
  [CodeBlockPlugin.key]: CodeBlockElement,
  [CodeLinePlugin.key]: CodeLineElement,
  [CodePlugin.key]: CodeLeaf,
  [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
  [ColumnItemPlugin.key]: ColumnElement,
  [ColumnPlugin.key]: ColumnGroupElement,
  [CommentsPlugin.key]: CommentLeaf,
  [DatePlugin.key]: DateElement,
  [EquationPlugin.key]: EquationElement,
  [FilePlugin.key]: MediaFileElement,
  [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: "h1" }),
  [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: "h2" }),
  [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: "h3" }),
  [HEADING_KEYS.h4]: withProps(HeadingElement, { variant: "h4" }),
  [HEADING_KEYS.h5]: withProps(HeadingElement, { variant: "h5" }),
  [HEADING_KEYS.h6]: withProps(HeadingElement, { variant: "h6" }),
  [HighlightPlugin.key]: HighlightLeaf,
  [HorizontalRulePlugin.key]: HrElement,
  [ImagePlugin.key]: ImageElement,
  [InlineEquationPlugin.key]: InlineEquationElement,
  [ItalicPlugin.key]: withProps(PlateLeaf, { as: "em" }),
  [KbdPlugin.key]: KbdLeaf,
  [LinkPlugin.key]: LinkElement,
  [MediaEmbedPlugin.key]: MediaEmbedElement,
  [MentionPlugin.key]: MentionElement,
  [ParagraphPlugin.key]: ParagraphElement,
  [PlaceholderPlugin.key]: MediaPlaceholderElement,
  [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: "s" }),
  [SubscriptPlugin.key]: withProps(PlateLeaf, { as: "sub" }),
  [SuperscriptPlugin.key]: withProps(PlateLeaf, { as: "sup" }),
  [TableCellHeaderPlugin.key]: TableCellHeaderElement,
  [TableCellPlugin.key]: TableCellElement,
  [TablePlugin.key]: TableElement,
  [TableRowPlugin.key]: TableRowElement,
  [TocPlugin.key]: TocElement,
  [TogglePlugin.key]: ToggleElement,
  [UnderlinePlugin.key]: withProps(PlateLeaf, { as: "u" }),
  [VideoPlugin.key]: MediaVideoElement,
};

export const editorComponents = {
  ...viewComponents,
  [AIPlugin.key]: AILeaf,
  [EmojiInputPlugin.key]: EmojiInputElement,
  [MentionInputPlugin.key]: MentionInputElement,
  [SlashInputPlugin.key]: SlashInputElement,
};

export const useCreateEditor = (
  options: UseCreateEditorHookOptions = {},
  deps: unknown[] = [],
) => {
  const {
    components,
    placeholders = true,
    readOnly,
    currentUser, // Destructure currentUser
    ...plateEditorOptions // Renamed from options to avoid conflict
  } = options;

  // Allow overriding any plugin options
  let pluginOverrides:
    | Record<string, { options: Record<string, unknown> }>
    | undefined;
  if (currentUser) {
    // Only include the current user in the users map
    const combinedUsers = {
      [currentUser.id]: {
        id: currentUser.id,
        name: currentUser.name || currentUser.id,
        avatarUrl: currentUser.avatarUrl ?? "",
      },
    };

    // start with user plugin override
    pluginOverrides = {
      [userPlugin.key]: {
        options: {
          currentUserId: currentUser.id,
          users: combinedUsers,
        },
      },
    };
    // also inject user ID into AIPlugin requests
    pluginOverrides[AIPlugin.key as string] = {
      options: {
        completeOptions: {
          api: "/api/ai/command",
          headers: { "X-User-Id": currentUser.id },
          body: { userId: currentUser.id },
        },
      },
    };
    // likewise for CopilotPlugin
    pluginOverrides[CopilotPlugin.key as string] = {
      options: {
        completeOptions: {
          api: "/api/ai/copilot",
          headers: { "X-User-Id": currentUser.id },
          body: { userId: currentUser.id },
        },
      },
    };
  }

  // `editorComponents` contains heterogeneous React components (elements and
  // leaves). Those are ultimately accepted by Plate as `NodeComponent`s which
  // have an `any` signature. For that reason we keep the value as
  // `Record<string, any>` and cast when we pass it to `usePlateEditor`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const combinedComponents: Record<string, any> = {
    ...(readOnly
      ? viewComponents
      : placeholders
        ? withPlaceholders(editorComponents)
        : editorComponents),
    ...((components ?? {}) as Record<string, unknown>),
  };

  return usePlateEditor<Value>(
    {
      components: combinedComponents,
      plugins: readOnly
        ? (viewPlugins as unknown as CreatePlateEditorOptions["plugins"])
        : (editorPlugins as unknown as CreatePlateEditorOptions["plugins"]),
      // If we have plugin overrides (i.e. the caller provided a currentUser),
      // forward them to Plate so they are merged with the default config.
      override: pluginOverrides ? { plugins: pluginOverrides } : undefined,
      ...plateEditorOptions,
    },
    // Add currentUser to deps for usePlateEditor if it's present
    // This ensures the editor re-initializes if currentUser changes.
    currentUser ? [...deps, currentUser] : deps,
  );
};
