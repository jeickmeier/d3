"use client";

import React, { useState, useEffect } from "react";
import { useCommentsSidebar } from "@/components/editor/core/CommentsSidebarContext";
import { Button } from "@/components/ui/button";
import { MessageSquareReplyIcon, XIcon, FilterIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  usePluginOption,
  useEditorRef,
  type PlateEditor,
} from "@udecode/plate/react";
import type { Value } from "@udecode/plate";
import type { TComment } from "../elements/comments-suggestions/comment";
import {
  discussionPlugin,
  type TDiscussion,
} from "@/components/editor/plugins/comments/discussion-plugin";
import { userPlugin } from "@/components/editor/plugins/user-plugin";
import { nanoid } from "nanoid";
import { DocumentCommentForm } from "./DocumentCommentForm";
import type { CommentTypeId } from "@/components/editor/plugins/comments/comment-types";
import { COMMENT_TYPES } from "@/components/editor/plugins/comments/comment-types";
import { Comment } from "@/components/editor/ui/elements/comments-suggestions/comment";
import { CommentForm } from "@/components/editor/ui/elements/comments-suggestions/comment-form";

// Sidebar width in pixels (approx 1.7 * 24rem ≈ 650px)
const SIDEBAR_WIDTH = 680; // px

export const CommentsSidebar: React.FC = () => {
  const { isCommentsSidebarOpen, setIsCommentsSidebarOpen } =
    useCommentsSidebar();
  const editor: PlateEditor = useEditorRef();

  const [activeReplyDiscussionId, setActiveReplyDiscussionId] = useState<
    string | null
  >(null);

  // All comments and filter state
  const visibleTypes = usePluginOption(
    discussionPlugin,
    "visibleTypes",
  ) as CommentTypeId[];
  const allDiscussions = usePluginOption(
    discussionPlugin,
    "discussions",
  ) as TDiscussion[];
  // Filter discussions based on selected types
  const discussions = React.useMemo(
    () =>
      allDiscussions.filter((d) =>
        d.comments.some((c) =>
          visibleTypes.includes(c.commentType ?? "formatting"),
        ),
      ),
    [allDiscussions, visibleTypes],
  );

  const currentUserId: string | undefined = usePluginOption(
    userPlugin,
    "currentUserId",
  );

  // State to support editing (disabled in sidebar but required by Comment API)
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const handleAddDocumentComment = (
    content: Value,
    commentType: CommentTypeId,
  ) => {
    if (!editor || !currentUserId) {
      console.error(
        "Editor or current user not available for adding document comment",
      );
      return;
    }
    const discussionId = nanoid();
    const commentId = nanoid();

    const newCommentContent: Value = content;

    const newComment: TComment = {
      id: commentId,
      discussionId,
      contentRich: newCommentContent,
      createdAt: new Date(),
      userId: currentUserId,
      isEdited: false,
      commentType,
    };

    const newDiscussion: TDiscussion = {
      id: discussionId,
      comments: [newComment],
      createdAt: new Date(),
      isResolved: false,
      userId: currentUserId,
      documentContent: undefined,
    };

    const currentDiscussionsFromEditor = (editor.getOption(
      discussionPlugin,
      "discussions",
    ) ?? []) as TDiscussion[];
    const updatedDiscussions = [...currentDiscussionsFromEditor, newDiscussion];

    editor.setOption(discussionPlugin, "discussions", updatedDiscussions);
  };

  const handleAddReplyToDiscussion = (
    discussionId: string,
    content: Value,
    commentType: CommentTypeId,
  ) => {
    if (!editor || !currentUserId) {
      console.error("Editor or current user not available for adding reply");
      return;
    }

    const commentId = nanoid();

    const newReplyComment: TComment = {
      id: commentId,
      discussionId,
      contentRich: content,
      createdAt: new Date(),
      userId: currentUserId,
      isEdited: false,
      commentType,
    };

    const currentDiscussions = (editor.getOption(
      discussionPlugin,
      "discussions",
    ) ?? []) as TDiscussion[];

    const updatedDiscussions = currentDiscussions.map((d) =>
      d.id === discussionId
        ? { ...d, comments: [...d.comments, newReplyComment] }
        : d,
    );

    editor.setOption(discussionPlugin, "discussions", updatedDiscussions);
    setActiveReplyDiscussionId(null);
  };

  // On mount, load persisted filter settings
  useEffect(() => {
    const saved = localStorage.getItem("visibleTypes");
    if (saved) {
      try {
        const parsed: CommentTypeId[] = JSON.parse(saved);
        editor.setOption(discussionPlugin, "visibleTypes", parsed);
      } catch {
        // ignore parse errors
      }
    }
  }, [editor]);

  // Side-effect: when sidebar is open, add right padding to body to make room
  useEffect(() => {
    if (isCommentsSidebarOpen) {
      const prevPadding = document.body.style.paddingRight;
      document.body.style.paddingRight = `${SIDEBAR_WIDTH}px`;
      return () => {
        document.body.style.paddingRight = prevPadding;
      };
    }
  }, [isCommentsSidebarOpen]);

  if (!isCommentsSidebarOpen) {
    return null;
  }

  return (
    <div
      className="fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-lg z-[60] p-4 flex flex-col"
      style={{ width: `${SIDEBAR_WIDTH}px` }}
    >
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <h2 className="text-lg font-semibold">Comments</h2>
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Filter comments">
                <FilterIcon className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-50 p-2">
              {COMMENT_TYPES.map((t) => (
                <div key={t.id} className="flex items-center space-x-2 p-1">
                  <Checkbox
                    checked={visibleTypes.includes(t.id)}
                    onCheckedChange={(checked) => {
                      const isChecked = checked === true;
                      const newVisible = isChecked
                        ? [...visibleTypes, t.id]
                        : visibleTypes.filter((id) => id !== t.id);
                      editor.setOption(
                        discussionPlugin,
                        "visibleTypes",
                        newVisible,
                      );
                      localStorage.setItem(
                        "visibleTypes",
                        JSON.stringify(newVisible),
                      );
                    }}
                  />
                  <span className="text-sm">{t.label}</span>
                </div>
              ))}
            </PopoverContent>
          </Popover>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCommentsSidebarOpen(false)}
            aria-label="Close comments sidebar"
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
        {discussions.length === 0 && (
          <p className="text-gray-500 text-sm">No comments yet.</p>
        )}
        {discussions.map((discussion) => {
          if (discussion.isResolved) return null;

          return (
            <div
              key={discussion.id}
              className="space-y-3 pb-4 mb-4 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0"
            >
              {discussion.documentContent && (
                <blockquote className="mb-3 p-2.5 text-xs text-gray-500 border-l-4 border-gray-300 bg-gray-50 italic">
                  {discussion.documentContent}
                </blockquote>
              )}
              {discussion.comments.map((comment, commentIndex) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  discussionLength={discussion.comments.length}
                  editingId={editingId}
                  index={commentIndex}
                  setEditingId={setEditingId}
                  documentContent={discussion.documentContent}
                  showDocumentContent={
                    commentIndex === 0 && !!discussion.documentContent
                  }
                  enableEditing={false}
                  onEditorClick={undefined}
                />
              ))}
              <div className="mt-2 pl-9">
                {activeReplyDiscussionId !== discussion.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveReplyDiscussionId(discussion.id);
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <MessageSquareReplyIcon className="h-3.5 w-3.5 mr-1.5" />
                    Reply
                  </Button>
                )}
                {activeReplyDiscussionId === discussion.id && (
                  <div className="mt-2">
                    <CommentForm
                      onSubmit={(value, type) =>
                        handleAddReplyToDiscussion(discussion.id, value, type)
                      }
                      placeholder="Write a reply..."
                      submitLabel="Send"
                      className="pr-8"
                    />
                    <div className="flex justify-end mt-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveReplyDiscussionId(null)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <DocumentCommentForm onAddComment={handleAddDocumentComment} />
    </div>
  );
};
