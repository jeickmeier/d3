"use client";

import * as React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Plate } from "@udecode/plate/react";

import { useCreateEditor } from "./core/use-create-editor";
import { SettingsDialog } from "./settings";
import { Editor, EditorContainer } from "./ui/primitives/editor";
import { CommentsSidebar } from "@comments/ui/sidebars/CommentsSidebar";

interface PlateEditorProps {
  currentUser?: {
    id: string;
    name?: string;
    avatarUrl?: string;
  };
}

export function PlateEditor({ currentUser }: PlateEditorProps) {
  const editor = useCreateEditor({ currentUser });

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor}>
        <EditorContainer>
          <Editor variant="demo" />
        </EditorContainer>

        <SettingsDialog />
        <CommentsSidebar />
      </Plate>
    </DndProvider>
  );
}
