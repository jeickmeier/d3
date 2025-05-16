"use client";

import React, { useState, useEffect } from "react";
import { useCommentsSidebar } from "@/components/editor/features/comments/CommentsSidebarContext";
import { Button } from "@/components/ui/button";
import { MessageSquareReplyIcon, XIcon, FilterIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { usePluginOption } from "@udecode/plate/react";
import {
  discussionPlugin,
  type TDiscussion,
} from "@comments/plugins/discussion-plugin";
import { CommentCreateForm } from "@comments/ui/elements/comment-create-form";
import { Comment } from "../elements/comment";
import { useVisibleCommentTypes } from "@comments/hooks/useVisibleCommentTypes";
import { filterDiscussionsByTypes } from "@comments/utils/discussion-utils";
import { CommentTypeFilterList } from "../elements/comment-type-filter-list";

export const CommentsSidebar: React.FC = () => {
  const { isCommentsSidebarOpen, setIsCommentsSidebarOpen } =
    useCommentsSidebar();

  const [activeReplyDiscussionId, setActiveReplyDiscussionId] = useState<
    string | null
  >(null);

  // No-op setter for read-only comment components
  const noopSetEditingId = React.useCallback<
    React.Dispatch<React.SetStateAction<string | null>>
  >(() => {}, []);

  // All comments and filter state
  const [visibleTypes, setVisibleTypes] = useVisibleCommentTypes();
  const allDiscussions = usePluginOption(
    discussionPlugin,
    "discussions",
  ) as TDiscussion[];
  const discussions = React.useMemo(
    () => filterDiscussionsByTypes(allDiscussions, visibleTypes),
    [allDiscussions, visibleTypes],
  );

  // Side-effect: when sidebar is open, add right padding to body to make room
  useEffect(() => {
    if (isCommentsSidebarOpen) {
      document.body.classList.add("pr-[50rem]");
      return () => {
        document.body.classList.remove("pr-[50rem]");
      };
    }
  }, [isCommentsSidebarOpen]);

  if (!isCommentsSidebarOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 right-0 h-full bg-white border-l border-gray-200 shadow-lg z-[60] p-4 flex flex-col w-[50rem]">
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
              <CommentTypeFilterList
                visibleTypes={visibleTypes}
                onChange={setVisibleTypes}
              />
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
        {discussions.map((discussion: TDiscussion) => {
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
              {discussion.comments.map((comment, commentIndex: number) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  discussionLength={discussion.comments.length}
                  editingId={null}
                  index={commentIndex}
                  setEditingId={noopSetEditingId}
                  documentContent={discussion.documentContent}
                  showDocumentContent={
                    commentIndex === 0 && !!discussion.documentContent
                  }
                  enableEditing={false}
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
                    <CommentCreateForm
                      discussionId={discussion.id}
                      showTypeSelector={false}
                      defaultType={
                        discussion.comments[0]?.commentType ?? "formatting"
                      }
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
      <CommentCreateForm className="pr-8" />
    </div>
  );
};
