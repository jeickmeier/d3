"use client";

// prettier-ignore
import {
  TextApi,
  ElementApi,
} from "@udecode/plate";
import { SuggestionPlugin } from "@udecode/plate-suggestion/react";
import { getSuggestionKey } from "@udecode/plate-suggestion";
import type { PlateEditor } from "@udecode/plate/react";

/**
 * Mark every node belonging to the given suggestion id as `status: "accepted"`.
 *
 * We DO NOT strip the suggestion data – instead we simply extend it so that
 * the UI can render an "accepted" indicator while the underlying document
 * still contains the tracked-change marks.
 */
export function markSuggestionAccepted(
  editor: PlateEditor,
  suggestionId: string,
) {
  const api = editor.getApi(SuggestionPlugin);

  editor.tf.withoutNormalizing(() => {
    // Iterate over all nodes that belong to this suggestion
    const entries = [
      ...editor.api.nodes({
        at: [],
        mode: "all",
        match: (n) => {
          // Inline suggestion
          if (
            TextApi.isText(n) &&
            n[getSuggestionKey(suggestionId)] !== undefined
          ) {
            return true;
          }
          // Block suggestion
          if (
            ElementApi.isElement(n) &&
            api.suggestion.isBlockSuggestion(n as any) &&
            (n as any).suggestion.id === suggestionId
          ) {
            return true;
          }
          return false;
        },
      }),
    ];

    entries.forEach(([node, path]) => {
      if (TextApi.isText(node)) {
        const key = getSuggestionKey(suggestionId);
        const currentData = node[key];
        if (!currentData) return;
        const newData = { ...currentData, status: "accepted" };
        // Slate transform needs to set a new value for the specific key
        editor.tf.setNodes({ [key]: newData }, { at: path });
      } else if (ElementApi.isElement(node)) {
        const currentData = (node as any).suggestion;
        if (!currentData) return;
        const newData = { ...currentData, status: "accepted" };
        editor.tf.setNodes({ suggestion: newData }, { at: path });
      }
    });
  });
}
