"use client";

import * as React from "react";

import type {
  PlateElementProps,
  RenderNodeWrapper,
} from "@udecode/plate/react";

import {
  type AnyPluginConfig,
  type NodeEntry,
  type Path,
  PathApi,
} from "@udecode/plate";
import { type TCommentText, getDraftCommentKey } from "@udecode/plate-comments";
import { CommentsPlugin } from "@udecode/plate-comments/react";
import {
  useEditorPlugin,
  useEditorRef,
  usePluginOption,
} from "@udecode/plate/react";
import { MessageSquareTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { commentsPlugin } from "@comments/plugins/comments-plugin";
import {
  type TDiscussion,
  discussionPlugin,
} from "@comments/plugins/discussion-plugin";
import { useVisibleCommentTypes } from "@comments/hooks/useVisibleCommentTypes";
import { filterDiscussionsByTypes } from "@comments/utils/discussion-utils";
import { Comment } from "./comment";
import { CommentCreateForm } from "./comment-create-form";

/**
 * BlockDiscussion is a higher-order wrapper that decorates a Slate block with the
 * inline comment / discussion UI.
 *
 * Plate invokes this `RenderNodeWrapper` for every element it renders. The wrapper
 * decides — based on the presence of comment nodes at the element's path — whether
 * to swap the default renderer for a custom `BlockCommentsContent` component.  If
 * the block has no associated comments (or only appears as a nested path such as
 * inside a table cell) the wrapper returns `undefined` which tells Plate to fall
 * back to the default element rendering.
 *
 * Returning a component instead of the usual JSX keeps the editor performant
 * because the heavy pop-over logic is only evaluated for elements that actually
 * need it.
 */
export const BlockDiscussion: RenderNodeWrapper<AnyPluginConfig> = (props) => {
  const { editor, element } = props;

  const commentsApi = editor.getApi(CommentsPlugin).comment;
  const blockPath = editor.api.findPath(element);

  // avoid duplicate in table or column
  if (!blockPath || blockPath.length > 1) return;

  const draftCommentNode = commentsApi.node({ at: blockPath, isDraft: true });

  const commentNodes = [...commentsApi.nodes({ at: blockPath })];

  if (commentNodes.length === 0 && !draftCommentNode) {
    return;
  }

  const BlockDiscussionComponent = (props: PlateElementProps) => (
    <BlockCommentsContent
      blockPath={blockPath}
      commentNodes={commentNodes}
      draftCommentNode={draftCommentNode}
      {...props}
    />
  );
  BlockDiscussionComponent.displayName = "BlockDiscussionComponent";

  return BlockDiscussionComponent;
};

/**
 * BlockCommentsContent renders the pop-over that lists all discussions belonging
 * to a single Slate block.  It is responsible for:
 *  • Deriving the set of discussions that should be visible (filters out resolved
 *    discussions or discussions whose type has been hidden by the user).
 *  • Handling the state that decides whether the pop-over is open, closed or in
 *    "new comment" mode.
 *  • Computing a *virtual* anchor element so that the pop-over follows the exact
 *    DOM node that is currently being interacted with.
 *
 * The component collapses to simply render `children` when there are no
 * discussions and no draft comment, avoiding unnecessary DOM noise for blocks
 * that are not commented.
 */
const BlockCommentsContent = ({
  blockPath,
  children,
  commentNodes,
  draftCommentNode,
}: PlateElementProps & {
  blockPath: Path;
  commentNodes: NodeEntry<TCommentText>[];
  draftCommentNode: NodeEntry<TCommentText> | undefined;
}) => {
  const editor = useEditorRef();

  const resolvedDiscussions = useResolvedDiscussion(commentNodes, blockPath);
  // Get visible types via shared hook
  const [visibleTypes] = useVisibleCommentTypes();
  // Filter discussions by selected types
  const filteredDiscussions = React.useMemo(
    () => filterDiscussionsByTypes(resolvedDiscussions, visibleTypes),
    [resolvedDiscussions, visibleTypes],
  );
  const discussionsCount = filteredDiscussions.length;
  const activeCommentId = usePluginOption(commentsPlugin, "activeId");
  const isCommenting = activeCommentId === getDraftCommentKey();
  const activeDiscussion =
    activeCommentId &&
    resolvedDiscussions.find((d) => d.id === activeCommentId);

  const noneActive = !activeDiscussion;

  const sortedData = filteredDiscussions;

  const selected = filteredDiscussions.some((d) => d.id === activeCommentId);

  const [_open, setOpen] = React.useState(selected);

  // in some cases, we may comment the multiple blocks
  const commentingBlock = usePluginOption(commentsPlugin, "commentingBlock");
  const commentingCurrent =
    !!commentingBlock && PathApi.equals(blockPath, commentingBlock);

  /**
   * Derived open state for the Radix `Popover`.
   *
   * We cannot rely solely on Radix' own `open` state (`_open`) because the
   * pop-over should also open when either a discussion inside this block
   * becomes the *active* one (`selected`) or when the user is in the dedicated
   * "add new comment" flow (`isCommenting`).
   *
   * The additional `commentingCurrent` check ensures that the draft comment we
   * are currently editing actually belongs to *this* block.  Without that
   * safeguard, opening a draft comment in a different block would also open
   * the pop-over here.
   */
  const open =
    _open ||
    selected ||
    (isCommenting && !!draftCommentNode && commentingCurrent);

  /**
   * Virtual anchor element used by Radix to position the pop-over exactly at
   * the location of the currently *active* comment.
   *
   * 1. Determine the Slate node that represents the active comment or draft.
   * 2. Convert that Slate node to its corresponding DOM element via
   *    `editor.api.toDOMNode`.
   * 3. Memoise the element so the calculation only runs when the dependencies
   *    change.
   *
   * Returning `null` tells Radix to fall back to anchoring the pop-over to its
   * trigger button.
   */
  const anchorElement = React.useMemo(() => {
    let activeNode: NodeEntry | undefined;

    if (activeCommentId) {
      if (activeCommentId === getDraftCommentKey()) {
        activeNode = draftCommentNode;
      } else {
        activeNode = commentNodes.find(
          ([node]) =>
            editor.getApi(CommentsPlugin).comment.nodeId(node) ===
            activeCommentId,
        );
      }
    }

    if (!activeNode) return null;

    return editor.api.toDOMNode(activeNode[0])!;
  }, [open, activeCommentId, editor.api, commentNodes, draftCommentNode]);

  if (discussionsCount === 0 && !draftCommentNode)
    return <div className="w-full">{children}</div>;

  return (
    <div className="flex w-full justify-between">
      <Popover
        open={open}
        onOpenChange={(_open_) => {
          if (!_open_ && isCommenting && draftCommentNode) {
            editor.tf.unsetNodes(getDraftCommentKey(), {
              at: [],
              mode: "lowest",
              match: (n) => n[getDraftCommentKey()],
            });
          }
          setOpen(_open_);
        }}
      >
        <div className="w-full">{children}</div>
        {anchorElement && (
          <PopoverAnchor
            asChild
            className="w-full"
            virtualRef={{ current: anchorElement }}
          />
        )}

        <PopoverContent
          className="max-h-[min(50dvh,calc(-24px+var(--radix-popper-available-height)))] w-[380px] max-w-[calc(100vw-24px)] min-w-[130px] overflow-y-auto p-0 data-[state=closed]:opacity-0"
          onCloseAutoFocus={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          align="center"
          side="bottom"
        >
          {isCommenting ? (
            <CommentCreateForm className="p-4" />
          ) : (
            <React.Fragment>
              {noneActive ? (
                sortedData.map((item, index) => (
                  <BlockComment
                    key={item.id}
                    discussion={item}
                    isLast={index === sortedData.length - 1}
                  />
                ))
              ) : (
                <React.Fragment>
                  {activeDiscussion && (
                    <BlockComment discussion={activeDiscussion} isLast={true} />
                  )}
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </PopoverContent>

        {discussionsCount > 0 && (
          <div className="relative left-0 size-0 select-none">
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="mt-1 ml-1 flex h-6 gap-1 px-1.5 py-0 text-muted-foreground/80 hover:text-muted-foreground/80 data-[active=true]:bg-muted"
                data-active={open}
                contentEditable={false}
              >
                <MessageSquareTextIcon className="size-4 shrink-0" />

                <span className="text-xs font-semibold">
                  {discussionsCount}
                </span>
              </Button>
            </PopoverTrigger>
          </div>
        )}
      </Popover>
    </div>
  );
};

/**
 * BlockComment is a purely presentational component that renders an individual
 * `TDiscussion`.
 *
 * It iterates over the discussion's `comments` array to display each comment and
 * finally renders a reply form that inherits the comment type of the first
 * comment in the thread.  A horizontal divider is shown between discussions,
 * except after the last one (`isLast`).
 */
export const BlockComment = ({
  discussion,
  isLast,
}: {
  discussion: TDiscussion;
  isLast: boolean;
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);

  return (
    <React.Fragment key={discussion.id}>
      <div className="p-4">
        {discussion.comments.map((comment, index) => (
          <Comment
            key={comment.id ?? index}
            comment={comment}
            discussionLength={discussion.comments.length}
            documentContent={discussion?.documentContent}
            editingId={editingId}
            index={index}
            setEditingId={setEditingId}
            showDocumentContent
          />
        ))}
        {/* Reply form: inherit parent type, hide selector */}
        <CommentCreateForm
          discussionId={discussion.id}
          showTypeSelector={false}
          defaultType={discussion.comments[0]?.commentType ?? "formatting"}
        />
      </div>

      {!isLast && <div className="h-px w-full bg-muted" />}
    </React.Fragment>
  );
};

/**
 * useResolvedDiscussion converts the raw comment nodes that live inside the
 * Slate document into fully-formed, *resolved* `TDiscussion` objects that belong
 * to the provided `blockPath`.
 *
 * The hook maintains a `uniquePathMap` on the `commentsPlugin` option bag to
 * remember the original block each comment was attached to.  This ensures
 * discussions continue to be associated with the correct block even after
 * structural editor changes (drag-and-drop, undo, table merges, …).
 *
 * Only discussions that still have a matching comment node *and* are not marked
 * as resolved are returned.
 */
export const useResolvedDiscussion = (
  commentNodes: NodeEntry<TCommentText>[],
  blockPath: Path,
) => {
  const { api, getOption, setOption } = useEditorPlugin(commentsPlugin);
  const discussions = usePluginOption(discussionPlugin, "discussions");

  React.useEffect(() => {
    let changed = false;
    const currentMap = getOption("uniquePathMap");
    const newMap = new Map(currentMap);

    commentNodes.forEach(([node]) => {
      const id = api.comment.nodeId(node);
      if (!id) return;

      const previousPath = newMap.get(id);
      if (previousPath) {
        const nodesAtPath = api.comment.node({ id, at: previousPath });
        if (!nodesAtPath) {
          newMap.set(id, blockPath);
          changed = true;
        }
      } else {
        newMap.set(id, blockPath);
        changed = true;
      }
    });

    if (changed) {
      setOption("uniquePathMap", newMap);
    }
  }, [commentNodes, blockPath, api.comment, getOption, setOption]);

  const resolvedDiscussions = React.useMemo(() => {
    const commentsIds = new Set(
      commentNodes.map(([node]) => api.comment.nodeId(node)).filter(Boolean),
    );

    return discussions
      .map((d) => ({
        ...d,
        createdAt: new Date(d.createdAt),
      }))
      .filter((item) => {
        const commentsPathMap = getOption("uniquePathMap");
        const firstBlockPath = commentsPathMap.get(item.id);

        if (!firstBlockPath) return false;
        if (!PathApi.equals(firstBlockPath, blockPath)) return false;

        return (
          api.comment.has({ id: item.id }) &&
          commentsIds.has(item.id) &&
          !item.isResolved
        );
      });
  }, [discussions, getOption, blockPath, api.comment, commentNodes]);

  return resolvedDiscussions;
};
