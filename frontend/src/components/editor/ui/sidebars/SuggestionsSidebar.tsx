"use client";

import React from "react";
import { useSuggestionsSidebar } from "@/components/editor/core/SuggestionsSidebarContext";
import { useEditorRef, usePluginOption } from "@udecode/plate/react";
import { SuggestionPlugin } from "@udecode/plate-suggestion/react";
import type { TSuggestionText } from "@udecode/plate-suggestion";
import { rejectSuggestion, getSuggestionKey } from "@udecode/plate-suggestion";
import { TextApi, type NodeEntry, type TElement } from "@udecode/plate";
import { Button } from "@/components/ui/button";
import { XIcon, CheckIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { discussionPlugin } from "@/components/editor/plugins/comments/discussion-plugin";
import { formatCommentDate } from "@/components/editor/ui/elements/comments-suggestions/comment";

interface SidebarSuggestion {
  id: string;
  type: string;
  userId: string;
  createdAt: Date;
  text: string;
  newText: string;
  status: "accepted" | "pending";
}

// Helper to get user initials for AvatarFallback
const getUserInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const SuggestionsSidebar: React.FC = () => {
  const { isSuggestionsSidebarOpen, setIsSuggestionsSidebarOpen } =
    useSuggestionsSidebar();

  const editor = useEditorRef();

  // Users map from discussion plugin (avatar/name lookup)
  const users =
    usePluginOption(discussionPlugin, "users") ?? ({} as Record<string, any>);

  const suggestionApi = editor.getApi(SuggestionPlugin);

  // Gather all suggestion nodes in the document. We include `editor.children` in
  // the dependency array so that this recalculates whenever the Slate document
  // changes, ensuring the sidebar stays in-sync with newly added or removed
  // suggestions.
  const suggestionNodes = React.useMemo(
    () => [
      ...editor.api.nodes<TElement | TSuggestionText>({
        at: [],
        mode: "all",
        match: (n) => Boolean((n as any)[SuggestionPlugin.key]),
      }),
    ],
    // Recompute when the editor instance changes
    [editor],
  );

  // Build a map of suggestionId -> nodes
  const suggestionMap = React.useMemo(() => {
    const map: Map<string, NodeEntry<TElement | TSuggestionText>[]> = new Map();

    suggestionNodes.forEach((entry) => {
      const id = suggestionApi.suggestion.nodeId(entry[0] as any);
      if (!id) return;
      if (!map.has(id)) map.set(id, []);
      map.get(id)!.push(entry);
    });

    return map;
  }, [suggestionNodes, suggestionApi.suggestion]);

  // Transform to sidebar-friendly objects
  const sidebarSuggestions: SidebarSuggestion[] = React.useMemo(() => {
    const arr: SidebarSuggestion[] = [];

    suggestionMap.forEach((entries, id) => {
      if (entries.length === 0) return;
      const nodeData = suggestionApi.suggestion.suggestionData(entries[0][0]);
      if (!nodeData) return;
      const createdAt = new Date(nodeData.createdAt);

      // Build simple text strings for display
      let text = "";
      let newText = "";

      entries.forEach(([node]) => {
        if (TextApi.isText(node)) {
          const nodeText = (node as any).text as string;
          const dataList = suggestionApi.suggestion.dataList(node as any);
          dataList.forEach((data) => {
            if (data.id !== id) return;
            if (data.type === "insert") newText += nodeText;
            else if (data.type === "remove") text += nodeText;
            else newText += nodeText;
          });
        }
      });

      // Fallback if no text
      if (!text && !newText) {
        text = "(block change)";
      }

      arr.push({
        id,
        type: nodeData.type,
        userId: nodeData.userId,
        createdAt,
        text,
        newText,
        status:
          (nodeData as any).status === "accepted" ? "accepted" : "pending",
      });
    });

    return arr.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [suggestionMap, suggestionApi.suggestion]);

  if (!isSuggestionsSidebarOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-[60] p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <h2 className="text-lg font-semibold">Suggestions</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSuggestionsSidebarOpen(false)}
          aria-label="Close suggestions sidebar"
        >
          <XIcon className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-grow overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
        {sidebarSuggestions.length === 0 && (
          <p className="text-gray-500 text-sm">No suggestions yet.</p>
        )}

        {sidebarSuggestions.map((sugg) => {
          const user = users?.[sugg.userId];
          const formattedDate = formatCommentDate(sugg.createdAt);
          return (
            <div
              key={sugg.id}
              className="space-y-2 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarImage
                    src={user?.avatarUrl}
                    alt={user?.name || "User"}
                  />
                  <AvatarFallback>{getUserInitials(user?.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-gray-700">
                      {user?.name || "Anonymous"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formattedDate}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 whitespace-pre-wrap">
                    <span className="font-medium mr-1 capitalize">
                      {sugg.type}:
                    </span>
                    {sugg.type === "insert" && sugg.newText}
                    {sugg.type === "remove" && sugg.text}
                    {sugg.type === "replace" && (
                      <>
                        <span className="line-through mr-1 text-red-500">
                          {sugg.text}
                        </span>
                        <span className="text-green-600">{sugg.newText}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-1">
                {sugg.status === "pending" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      import(
                        "@/components/editor/core/mark-suggestion-accepted"
                      ).then(({ markSuggestionAccepted }) => {
                        markSuggestionAccepted(editor as any, sugg.id);
                      });
                    }}
                    className="text-xs"
                  >
                    <CheckIcon className="h-3.5 w-3.5 mr-1.5" /> Accept
                  </Button>
                ) : (
                  <span className="text-xs text-emerald-600 flex items-center">
                    <CheckIcon className="h-3.5 w-3.5 mr-1" /> Accepted
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const basic = {
                      suggestionId: sugg.id,
                      keyId: getSuggestionKey(sugg.id),
                      type: sugg.type,
                      userId: sugg.userId,
                      createdAt: sugg.createdAt,
                      newText: sugg.newText,
                      text: sugg.text,
                      comments: [],
                    } as any;
                    // Temporarily disable suggestion tracking while applying the change
                    suggestionApi.suggestion.withoutSuggestions(() => {
                      rejectSuggestion(editor, basic);
                    });
                  }}
                  className="text-xs"
                >
                  <XIcon className="h-3.5 w-3.5 mr-1.5" /> Reject
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
