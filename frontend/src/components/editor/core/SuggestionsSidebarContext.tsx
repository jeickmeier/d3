"use client";

import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface SuggestionsSidebarContextType {
  isSuggestionsSidebarOpen: boolean;
  setIsSuggestionsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SuggestionsSidebarContext = createContext<
  SuggestionsSidebarContextType | undefined
>(undefined);

export const SuggestionsSidebarProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isSuggestionsSidebarOpen, setIsSuggestionsSidebarOpen] =
    useState(false);

  return (
    <SuggestionsSidebarContext.Provider
      value={{ isSuggestionsSidebarOpen, setIsSuggestionsSidebarOpen }}
    >
      {children}
    </SuggestionsSidebarContext.Provider>
  );
};

export const useSuggestionsSidebar = (): SuggestionsSidebarContextType => {
  const context = useContext(SuggestionsSidebarContext);
  if (context === undefined) {
    throw new Error(
      "useSuggestionsSidebar must be used within a SuggestionsSidebarProvider",
    );
  }
  return context;
};
