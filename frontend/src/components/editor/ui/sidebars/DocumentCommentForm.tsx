"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
// import { Textarea } from "@/components/ui/textarea"; // Commented out for now

interface DocumentCommentFormProps {
  onAddComment: (commentText: string) => void;
  placeholder?: string;
}

export const DocumentCommentForm: React.FC<DocumentCommentFormProps> = ({
  onAddComment,
  placeholder = "Add a document comment...",
}) => {
  const [commentText, setCommentText] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(commentText.trim());
      setCommentText("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 mb-2 border-t pt-4">
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
