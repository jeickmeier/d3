"use client";

import React from "react";

import { type Value } from "@udecode/plate";

import { CommentForm } from "@/components/editor/ui/elements/comments-suggestions/comment-form";

import { CommentTypeId } from "@/components/editor/plugins/comments/comment-types";

interface DocumentCommentFormProps {
  onAddComment: (commentValue: Value, commentType: CommentTypeId) => void;
  placeholder?: string;
}

export const DocumentCommentForm: React.FC<DocumentCommentFormProps> = ({
  onAddComment,
  placeholder = "Add a document comment...",
}) => {
  const handleSubmit = React.useCallback(
    (value: Value, type: CommentTypeId) => {
      onAddComment(value, type);
    },
    [onAddComment],
  );

  return (
    <div className="mt-4 mb-2 border-t pt-4">
      <CommentForm
        onSubmit={handleSubmit}
        placeholder={placeholder}
        submitLabel="Add"
        className="pr-8"
      />
    </div>
  );
};
