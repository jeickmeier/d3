"use client";

// React import removed because it's no longer needed
import { useChat as useBaseChat } from "@ai-sdk/react";
import { useSettings } from "@/components/editor/settings/settings";

export const useChat = () => {
  const { aiModel } = useSettings();

  const chat = useBaseChat({
    id: "editor",
    api: "/api/ai/command",
    body: {
      model: aiModel.value,
    },
  });

  return chat;
};
