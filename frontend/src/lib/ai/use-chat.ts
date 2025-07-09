"use client";

// React import removed because it's no longer needed
import { useChat as useBaseChat } from "@ai-sdk/react";
import { useSettings } from "@/lib/settings/context";

export const useChat = (userId?: string) => {
  const { aiSelection } = useSettings();
  const { provider, model } = aiSelection;

  const chat = useBaseChat({
    id: "editor",
    api: "/api/ai/command",
    headers: userId ? { "X-User-Id": userId } : undefined,
    body: {
      model: `${provider.value}:${model.value}`,
      userId: userId ?? "",
    },
  });

  return chat;
};
