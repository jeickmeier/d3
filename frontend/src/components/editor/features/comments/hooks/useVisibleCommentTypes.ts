import { useEffect } from "react";
import { useEditorRef } from "@udecode/plate/react";

import { discussionPlugin } from "@comments/plugins/discussion-plugin";
import type { CommentTypeId } from "@comments/types/comment-types";
import { usePersistentState } from "@/hooks/usePersistentState";

/**
 * Hook that exposes the current list of visible comment types together with a
 * setter that automatically
 *   • updates the Plate `discussionPlugin` option, and
 *   • persists the selection to `localStorage`.
 */
export function useVisibleCommentTypes(): [
  CommentTypeId[],
  (types: CommentTypeId[]) => void,
] {
  const editor = useEditorRef();

  const [visibleTypes, setVisibleTypesState] = usePersistentState<
    CommentTypeId[]
  >("visibleTypes", []);

  // Keep Plate plugin option in sync whenever state changes.
  useEffect(() => {
    editor.setOption(discussionPlugin, "visibleTypes", visibleTypes);
  }, [editor, visibleTypes]);

  const setVisibleTypes = (types: CommentTypeId[]) => {
    setVisibleTypesState(types);
    editor.setOption(discussionPlugin, "visibleTypes", types);
  };

  return [visibleTypes, setVisibleTypes];
}
