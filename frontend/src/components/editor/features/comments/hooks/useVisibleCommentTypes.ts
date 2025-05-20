import { useEffect } from "react";
import { useEditorRef } from "@udecode/plate/react";

import { discussionPlugin } from "@comments/plugins/discussion-plugin";
import type { CommentTypeId } from "@comments/types/comment-types";
import { usePersistentState } from "@/hooks/usePersistentState";
import { COMMENT_TYPES } from "@comments/types/comment-types";

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

  // Initialise with all comment types visible so new users immediately see
  // their comments. If the user has an existing preference stored in
  // localStorage, `usePersistentState` will override this default.
  const [visibleTypes, setVisibleTypesState] = usePersistentState<
    CommentTypeId[]
  >(
    "visibleTypes",
    COMMENT_TYPES.map((t) => t.id),
  );

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
