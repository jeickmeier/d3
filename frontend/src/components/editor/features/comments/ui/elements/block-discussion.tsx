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

  const open =
    _open ||
    selected ||
    (isCommenting && !!draftCommentNode && commentingCurrent);

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
      if (PathApi.isPath(previousPath)) {
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
      .map((d: TDiscussion) => ({
        ...d,
        createdAt: new Date(d.createdAt),
      }))
      .filter((item: TDiscussion) => {
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
