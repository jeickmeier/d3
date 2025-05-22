"use client";

import * as React from "react";

import type { AIChatPluginConfig } from "@udecode/plate-ai/react";

import { PathApi } from "@udecode/plate";
import { streamInsertChunk, withAIBatch } from "@udecode/plate-ai";
import { AIChatPlugin, AIPlugin, useChatChunk } from "@udecode/plate-ai/react";
import { usePluginOption } from "@udecode/plate/react";

import { AILoadingBar } from "@components/editor/features/ai/ui/elements/ai-loading-bar";
import { AIMenu } from "@components/editor/features/ai/ui/menus/ai/ai-menu";
import { markdownPlugin } from "@components/editor/core/plugins/markdown-plugin";

import { cursorOverlayPlugin } from "@components/editor/core/plugins/cursor-overlay-plugin";

// Import centralized prompt templates
import { PROMPT_TEMPLATES } from "@components/editor/features/ai/prompts/prompts";

export const aiPlugins = [
  cursorOverlayPlugin,
  markdownPlugin,
  AIPlugin,
  AIChatPlugin.configure({
    options: {
      promptTemplate: ({ isBlockSelecting, isSelecting }) => {
        return isBlockSelecting
          ? PROMPT_TEMPLATES.userBlockSelecting
          : isSelecting
            ? PROMPT_TEMPLATES.userSelecting
            : PROMPT_TEMPLATES.userDefault;
      },
      systemTemplate: ({ isBlockSelecting, isSelecting }) => {
        return isBlockSelecting
          ? PROMPT_TEMPLATES.systemBlockSelecting
          : isSelecting
            ? PROMPT_TEMPLATES.systemSelecting
            : PROMPT_TEMPLATES.systemDefault;
      },
    },
    render: {
      afterContainer: () => <AILoadingBar />,
      afterEditable: () => <AIMenu />,
    },
  }).extend({
    useHooks: ({ editor, getOption }) => {
      const mode = usePluginOption(
        { key: "aiChat" } as AIChatPluginConfig,
        "mode",
      );

      useChatChunk({
        onChunk: ({ chunk, isFirst, nodes }) => {
          if (isFirst && mode == "insert") {
            editor.tf.withoutSaving(() => {
              editor.tf.insertNodes(
                {
                  children: [{ text: "" }],
                  type: AIChatPlugin.key,
                },
                {
                  at: PathApi.next(editor.selection!.focus.path.slice(0, 1)),
                },
              );
            });
            editor.setOption(AIChatPlugin, "streaming", true);
          }

          if (mode === "insert" && nodes.length > 0) {
            withAIBatch(
              editor,
              () => {
                if (!getOption("streaming")) return;
                editor.tf.withScrolling(() => {
                  streamInsertChunk(editor, chunk, {
                    textProps: {
                      ai: true,
                    },
                  });
                });
              },
              { split: isFirst },
            );
          }
        },
        onFinish: () => {
          editor.setOption(AIChatPlugin, "streaming", false);
          editor.setOption(AIChatPlugin, "_blockChunks", "");
          editor.setOption(AIChatPlugin, "_blockPath", null);
        },
      });
    },
  }),
] as const;
