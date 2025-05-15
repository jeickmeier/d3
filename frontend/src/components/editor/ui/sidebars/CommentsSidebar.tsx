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
  ParagraphPlugin,
  useEditorRef,
  type PlateEditor,
} from "@udecode/plate/react";
import { Node } from "slate";
import type { Value } from "@udecode/plate";
import type { TComment } from "../elements/comments-suggestions/comment";
import {
  discussionPlugin,
  type TDiscussion,
} from "@/components/editor/plugins/comments/discussion-plugin";
import { userPlugin } from "@/components/editor/plugins/user-plugin";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCommentDate } from "@/components/editor/ui/elements/comments-suggestions/comment";
import { nanoid } from "nanoid";
import { DocumentCommentForm } from "./DocumentCommentForm";
import type { CommentTypeId } from "@/components/editor/plugins/comments/comment-types";
import { COMMENT_TYPES_MAP } from "@/components/editor/plugins/comments/comment-types";
import { COMMENT_TYPES } from "@/components/editor/plugins/comments/comment-types";

// Helper to get user initials for AvatarFallback
const getUserInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const CommentsSidebar: React.FC = () => {
  const { isCommentsSidebarOpen, setIsCommentsSidebarOpen } =
    useCommentsSidebar();
  const editor: PlateEditor = useEditorRef();

  const [activeReplyDiscussionId, setActiveReplyDiscussionId] = useState<
    string | null
  >(null);
  const [replyText, setReplyText] = useState<string>("");

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

  const users = usePluginOption(userPlugin, "users") ?? {};

  const currentUserId: string | undefined = usePluginOption(
    userPlugin,
    "currentUserId",
  );

  const handleAddDocumentComment = (
    text: string,
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

    const newCommentContent: Value = [
      {
        type: ParagraphPlugin.key as string,
        children: [{ text }],
      },
    ];

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

  const handleAddReplyToDiscussion = (discussionId: string, text: string) => {
    if (!editor || !currentUserId || !text.trim()) {
      console.error(
        "Editor, current user, or text not available for adding reply",
      );
      return;
    }

    const commentId = nanoid();
    const newReplyContent: Value = [
      {
        type: ParagraphPlugin.key as string,
        children: [{ text: text.trim() }],
      },
    ];

    // Derive reply type from the parent discussion (default to formatting)
    const currentDiscussions = (editor.getOption(
      discussionPlugin,
      "discussions",
    ) ?? []) as TDiscussion[];
    const parentDiscussion = currentDiscussions.find(
      (d) => d.id === discussionId,
    );
    const replyType: CommentTypeId =
      parentDiscussion?.comments?.[0]?.commentType ?? "formatting";
    const newReplyComment: TComment = {
      id: commentId,
      discussionId,
      contentRich: newReplyContent,
      createdAt: new Date(),
      userId: currentUserId,
      isEdited: false,
      commentType: replyType,
    };

    const updatedDiscussions = currentDiscussions.map((discussion) => {
      if (discussion.id === discussionId) {
        return {
          ...discussion,
          comments: [...discussion.comments, newReplyComment],
        };
      }
      return discussion;
    });

    editor.setOption(discussionPlugin, "discussions", updatedDiscussions);
    setReplyText("");
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

  if (!isCommentsSidebarOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-[60] p-4 flex flex-col">
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
              {discussion.comments.map((comment, commentIndex) => {
                const user = users?.[comment.userId];
                const commentText = Node.string({
                  children: comment.contentRich,
                  type: "p",
                } as any);
                const formattedDate = formatCommentDate(
                  new Date(comment.createdAt),
                );
                const indentationClass = commentIndex > 0 ? "ml-6" : "";
                const badge =
                  COMMENT_TYPES_MAP[comment.commentType ?? "formatting"];

                return (
                  <div
                    key={comment.id}
                    className={`flex space-x-3 ${indentationClass}`}
                  >
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage
                        src={user?.avatarUrl}
                        alt={user?.name || "User"}
                      />
                      <AvatarFallback>
                        {getUserInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 bg-gray-50 p-2.5 rounded-md shadow-sm border border-gray-100">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center space-x-1">
                          {/* Only show badge for the first comment */}
                          {commentIndex === 0 && (
                            <span
                              className={`px-1.5 text-[10px] font-medium rounded ${badge.bg}`}
                            >
                              {badge.label}
                            </span>
                          )}
                          <span className="text-xs font-semibold text-gray-700">
                            {user?.name || "Anonymous"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formattedDate}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap">
                        {commentText}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div className="mt-2 pl-9">
                {activeReplyDiscussionId !== discussion.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setActiveReplyDiscussionId(discussion.id);
                      setReplyText("");
                    }}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <MessageSquareReplyIcon className="h-3.5 w-3.5 mr-1.5" />
                    Reply
                  </Button>
                )}
                {activeReplyDiscussionId === discussion.id && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleAddReplyToDiscussion(discussion.id, replyText);
                    }}
                    className="flex flex-col space-y-2"
                  >
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className="w-full text-xs p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[50px] shadow-sm focus:outline-none focus:ring-1 focus:ring-opacity-50 resize-none"
                      rows={2}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveReplyDiscussionId(null);
                          setReplyText("");
                        }}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={!replyText.trim()}
                        className="text-xs"
                      >
                        Submit Reply
                      </Button>
                    </div>
                  </form>
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
