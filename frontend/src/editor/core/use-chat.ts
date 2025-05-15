"use client";

import * as React from "react";

import { useChat as useBaseChat } from "@ai-sdk/react";

import { useSettings } from "@/editor/settings";
import { fakeStreamText } from "../lib/mock-chat-stream";

export const useChat = () => {
  const { aiModel } = useSettings();

  // remove when you implement the route /api/ai/command
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const _abortFakeStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  };

  const chat = useBaseChat({
    id: "editor",
    api: "/api/ai/command",
    // IMPORTANT: The OpenAI API key is now sourced from the NEXT_PUBLIC_OPENAI_API_KEY environment variable.
    // Ensure this variable is set in your .env.local file for development.
    // In a production environment, the /api/ai/command endpoint should securely manage the API key
    // and not rely on a client-exposed environment variable if possible, or ensure the key has minimal privileges.
    body: {
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
      model: aiModel.value,
    },
    // Mock the API response. Remove it when you implement the route /api/ai/command
    fetch: async (input, init) => {
      const res = await fetch(input, init);

      if (!res.ok) {
        let sample: "markdown" | "mdx" | null = null;

        try {
          const content = JSON.parse(init?.body as string).messages.at(
            -1,
          ).content;

          if (content.includes("Generate a markdown sample")) {
            sample = "markdown";
          } else if (content.includes("Generate a mdx sample")) {
            sample = "mdx";
          }
        } catch {
          sample = null;
        }

        abortControllerRef.current = new AbortController();
        await new Promise((resolve) => setTimeout(resolve, 400));

        const stream = fakeStreamText({
          sample,
          signal: abortControllerRef.current.signal,
        });

        return new Response(stream, {
          headers: {
            Connection: "keep-alive",
            "Content-Type": "text/plain",
          },
        });
      }

      return res;
    },
  });

  return { ...chat, _abortFakeStream };
};
