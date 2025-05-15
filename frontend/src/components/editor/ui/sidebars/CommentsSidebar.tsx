"use client";

import React, { useState } from "react";
import { useCommentsSidebar } from "@/components/editor/core/CommentsSidebarContext";
import { Button } from "@/components/ui/button";
import { MessageSquareReplyIcon, XIcon } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCommentDate } from "@/components/editor/ui/elements/comments-suggestions/comment";
import { nanoid } from "nanoid";
import { DocumentCommentForm } from "./DocumentCommentForm";

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

  // prettier-ignore
  const discussions = (usePluginOption(discussionPlugin, "discussions") ?? []) as TDiscussion[];

  const users = usePluginOption(discussionPlugin, "users") ?? {};

  const currentUserId: string | undefined = usePluginOption(
    discussionPlugin,
    "currentUserId",
  );

  const handleAddDocumentComment = (text: string) => {
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
    const newCommentContent: Value = [
      {
        type: ParagraphPlugin.key as string,
        children: [{ text: text.trim() }],
      },
    ];

    const newReplyComment: TComment = {
      id: commentId,
      discussionId,
      contentRich: newCommentContent,
      createdAt: new Date(),
      userId: currentUserId,
      isEdited: false,
    };

    const currentDiscussions = (editor.getOption(
      discussionPlugin,
      "discussions",
    ) ?? []) as TDiscussion[];

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

  if (!isCommentsSidebarOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-lg z-[60] p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4 pb-2 border-b">
        <h2 className="text-lg font-semibold">Comments</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCommentsSidebarOpen(false)}
          aria-label="Close comments sidebar"
        >
          <XIcon className="h-5 w-5" />
        </Button>
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
                        <span className="text-xs font-semibold text-gray-700">
                          {user?.name || "Anonymous"}
                        </span>
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
