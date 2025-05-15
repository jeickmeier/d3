"use client";

import type { Value } from "@udecode/plate";
import * as React from "react";
import { useMemo } from "react";

import { withProps } from "@udecode/cn";
import { AIPlugin } from "@udecode/plate-ai/react";
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
import { ExcalidrawPlugin } from "@udecode/plate-excalidraw/react";
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
import { SuggestionPlugin } from "@udecode/plate-suggestion/react";
import {
  TableCellHeaderPlugin,
  TableCellPlugin,
  TablePlugin,
  TableRowPlugin,
} from "@udecode/plate-table/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import {
  ParagraphPlugin,
  PlateLeaf,
  usePlateEditor,
  type PlatePlugin,
} from "@udecode/plate/react";

import { editorPlugins } from "@/components/editor/plugins/editor-plugins";
import { AILeaf } from "@/components/editor/ui/features/ai/ai-leaf";
import { BlockquoteElement } from "@/components/editor/ui/elements/blockquote/blockquote-element";
import { CalloutElement } from "@/components/editor/ui/elements/callout/callout-element";
import { CodeBlockElement } from "@/components/editor/ui/code/code-block-element";
import { CodeLeaf } from "@/components/editor/ui/code/code-leaf";
import { CodeLineElement } from "@/components/editor/ui/code/code-line-element";
import { CodeSyntaxLeaf } from "@/components/editor/ui/code/code-syntax-leaf";
import { ColumnElement } from "@/components/editor/ui/elements/layout/column-element";
import { ColumnGroupElement } from "@/components/editor/ui/elements/layout/column-group-element";
import { CommentLeaf } from "@/components/editor/ui/features/comments-suggestions/comment-leaf";
import { DateElement } from "@/components/editor/ui/elements/date/date-element";
import { EmojiInputElement } from "@/components/editor/ui/features/emoji/emoji-input-element";
import { EquationElement } from "@/components/editor/ui/elements/equation/equation-element";
import { ExcalidrawElement } from "@/components/editor/ui/elements/excalidraw/excalidraw-element";
import { HeadingElement } from "@/components/editor/ui/elements/heading/heading-element";
import { HighlightLeaf } from "@/components/editor/ui/leafs/highlight-leaf";
import { HrElement } from "@/components/editor/ui/elements/heading/hr-element";
import { ImageElement } from "@/components/editor/ui/elements/image/image-element";
import { InlineEquationElement } from "@/components/editor/ui/elements/equation/inline-equation-element";
import { KbdLeaf } from "@/components/editor/ui/leafs/kbd-leaf";
import { LinkElement } from "@/components/editor/ui/elements/link/link-element";
import { MediaAudioElement } from "@/components/editor/ui/elements/media/media-audio-element";
import { MediaEmbedElement } from "@/components/editor/ui/elements/media/media-embed-element";
import { MediaFileElement } from "@/components/editor/ui/elements/media/media-file-element";
import { MediaPlaceholderElement } from "@/components/editor/ui/elements/media/media-placeholder-element";
import { MediaVideoElement } from "@/components/editor/ui/elements/media/media-video-element";
import { MentionElement } from "@/components/editor/ui/elements/mention/mention-element";
import { MentionInputElement } from "@/components/editor/ui/elements/mention/mention-input-element";
import { ParagraphElement } from "@/components/editor/ui/elements/paragraph/paragraph-element";
import { withPlaceholders } from "@/components/editor/ui/common/placeholder";
import { SlashInputElement } from "@/components/editor/ui/elements/slash-input/slash-input-element";
import { SuggestionLeaf } from "@/components/editor/ui/leafs/suggestion-leaf";
import {
  TableCellElement,
  TableCellHeaderElement,
} from "@/components/editor/ui/elements/table/table-cell-element";
import { TableElement } from "@/components/editor/ui/elements/table/table-element";
import { TableRowElement } from "@/components/editor/ui/elements/table/table-row-element";
import { TocElement } from "@/components/editor/ui/elements/toc/toc-element";
import { ToggleElement } from "@/components/editor/ui/elements/toggle/toggle-element";

import { authClient } from "@/lib/auth/auth-client";
import { discussionPlugin, TDiscussion } from "./plugins/discussion-plugin";
import { MyValue } from "@/components/editor/plate-types";

export const viewComponents = {
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
  [ExcalidrawPlugin.key]: ExcalidrawElement,
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
  [SuggestionPlugin.key]: SuggestionLeaf,
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

// Placeholder for initial discussions, actual data might come from API or props
const initialDiscussions: TDiscussion[] = [];

// Define a more flexible type for hookOptions based on common usePlateEditor props
interface UseCreateEditorProps {
  id?: string;
  initialValue?: Value;
  plugins?: any[]; // Reverted to any[] due to complex type issues
  components?: Record<string, React.ComponentType<any>>;
  override?: Record<string, any>;
  readOnly?: boolean;
  placeholders?: boolean;
  // Add other common Plate editor options if needed
}

export const useCreateEditor = (
  hookOptions: UseCreateEditorProps = {},
  deps: React.DependencyList = [],
) => {
  const { data: session } = authClient.useSession();

  if (typeof window !== "undefined") {
    // Log only on the client
    console.log(
      "Client useCreateEditor hookOptions.initialValue:",
      JSON.stringify(hookOptions.initialValue),
    );
  }

  const {
    id = "main",
    initialValue: initialValueProp,
    plugins: hookGivenPlugins,
    components: hookGivenComponents,
    override,
    readOnly = false,
    placeholders = true,
    ...restHookOptions
  } = hookOptions;

  const currentUserId = session?.user?.id;
  const currentUserName = session?.user?.name || "Anonymous";
  const avatarUrl = (seed: string) =>
    `https://api.dicebear.com/9.x/glass/svg?seed=${seed}`;
  const currentUserAvatar =
    session?.user?.image || avatarUrl(currentUserId || "default-user");

  const memoizedPlugins = useMemo(() => {
    let newPlugins = hookGivenPlugins || editorPlugins;

    // Dynamically configure the discussion plugin with current user data
    if (currentUserId) {
      const discussionPluginIndex = newPlugins.findIndex(
        (p: PlatePlugin) => p.key === discussionPlugin.key,
      );
      const baseDiscussionPluginOptions = discussionPlugin.options || {};
      const baseUsers = baseDiscussionPluginOptions.users || {};
      const baseDiscussions =
        baseDiscussionPluginOptions.discussions || initialDiscussions;

      const configuredDiscussionPlugin = discussionPlugin.extend({
        options: {
          ...baseDiscussionPluginOptions,
          currentUserId: currentUserId,
          users: {
            ...baseUsers,
            [currentUserId]: {
              id: currentUserId,
              name: currentUserName,
              avatarUrl: currentUserAvatar,
            },
          },
          discussions: baseDiscussions,
        },
      });

      if (discussionPluginIndex > -1) {
        newPlugins = [...newPlugins]; // Create a new array instance for immutability
        newPlugins[discussionPluginIndex] = configuredDiscussionPlugin;
      } else {
        // If discussionPlugin wasn't in the initial set, add the configured version.
        // This might occur if hookGivenPlugins is provided and doesn't include it.
        newPlugins = [...newPlugins, configuredDiscussionPlugin];
      }
    }
    return newPlugins;
  }, [hookGivenPlugins, currentUserId, currentUserName, currentUserAvatar]); // Added editorPlugins to dependency array and formatted

  const resolvedComponents = useMemo(() => {
    const baseComps = readOnly
      ? viewComponents
      : placeholders
        ? withPlaceholders(editorComponents)
        : editorComponents;
    return { ...baseComps, ...hookGivenComponents };
  }, [readOnly, placeholders, hookGivenComponents]);

  const defaultValue = React.useMemo<MyValue>(
    () => [
      {
        type: ParagraphPlugin.key,
        children: [{ text: "Start typing..." }],
      },
    ],
    [],
  );

  if (typeof window !== "undefined") {
    // Log only on the client
    console.log(
      "Client useCreateEditor final initialValue:",
      JSON.stringify(initialValueProp ?? defaultValue),
    );
  }

  const editor = usePlateEditor(
    {
      id,
      value: initialValueProp ?? defaultValue,
      plugins: memoizedPlugins,
      components: resolvedComponents,
      override,
      ...restHookOptions,
    },
    [
      id,
      initialValueProp,
      memoizedPlugins,
      resolvedComponents,
      override,
      ...deps,
    ],
  );

  return editor;
};
