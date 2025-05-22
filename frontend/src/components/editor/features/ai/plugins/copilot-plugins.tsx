"use client";

import { CopilotPlugin } from "@udecode/plate-ai/react";
import { serializeMd, stripMarkdown } from "@udecode/plate-markdown";

import { COPILOT_PROMPTS } from "@components/editor/features/ai/prompts/prompts";

import { GhostText } from "@components/editor/features/ai/ui/primitives/ghost-text";
import { markdownPlugin } from "@components/editor/core/plugins/markdown-plugin";

export const copilotPlugins = [
  markdownPlugin,
  CopilotPlugin.configure(({ api }) => ({
    options: {
      completeOptions: {
        api: "/api/ai/copilot",
        body: {
          system: COPILOT_PROMPTS.system,
        },
        onError: () => {
          console.error("Copilot API call failed or is not implemented.");
        },
        onFinish: (_, completion) => {
          if (completion === "0") return;

          api.copilot.setBlockSuggestion({
            text: stripMarkdown(completion),
          });
        },
      },
      debounceDelay: 500,
      renderGhostText: GhostText,
      getPrompt: ({ editor }) => {
        const contextEntry = editor.api.block({ highest: true });

        if (!contextEntry) return "";

        const prompt = serializeMd(editor, {
          value: [contextEntry[0]],
        });

        return COPILOT_PROMPTS.generatePrompt(prompt);
      },
    },
  })),
] as const;
