"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface CommentsSidebarContextType {
  isCommentsSidebarOpen: boolean;
  setIsCommentsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CommentsSidebarContext = createContext<
  CommentsSidebarContextType | undefined
>(undefined);

export const CommentsSidebarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isCommentsSidebarOpen, setIsCommentsSidebarOpen] = useState(false);

  return (
    <CommentsSidebarContext.Provider
      value={{ isCommentsSidebarOpen, setIsCommentsSidebarOpen }}
    >
      {children}
    </CommentsSidebarContext.Provider>
  );
};

export const useCommentsSidebar = (): CommentsSidebarContextType => {
  const context = useContext(CommentsSidebarContext);
  if (context === undefined) {
    throw new Error(
      "useCommentsSidebar must be used within a CommentsSidebarProvider",
    );
  }
  return context;
};
