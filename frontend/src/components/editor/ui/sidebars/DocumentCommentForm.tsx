"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  COMMENT_TYPES,
  CommentTypeId,
} from "@/components/editor/plugins/comments/comment-types";

interface DocumentCommentFormProps {
  onAddComment: (commentText: string, commentType: CommentTypeId) => void;
  placeholder?: string;
}

export const DocumentCommentForm: React.FC<DocumentCommentFormProps> = ({
  onAddComment,
  placeholder = "Add a document comment...",
}) => {
  const [commentText, setCommentText] = useState("");
  const [selectedType, setSelectedType] = useState<CommentTypeId>("formatting");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(commentText.trim(), selectedType);
      setCommentText("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 mb-2 border-t pt-4">
      <div className="mb-2 flex space-x-2">
        <Select
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as CommentTypeId)}
        >
          <SelectTrigger className="h-8 w-full">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {COMMENT_TYPES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <textarea // Changed to standard HTML textarea
        value={commentText}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="w-full text-sm p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 min-h-[60px] shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
        rows={3}
      />
      <Button
        type="submit"
        disabled={!commentText.trim()}
        className="mt-2 w-full text-xs py-1.5"
        size="sm"
      >
        Add Document Comment
      </Button>
    </form>
  );
};
