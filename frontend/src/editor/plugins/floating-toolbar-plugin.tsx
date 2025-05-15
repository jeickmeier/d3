"use client";

import { createPlatePlugin } from "@udecode/plate/react";

import { FloatingToolbar } from "@/editor/ui/toolbars/floating/floating-toolbar";
import { FloatingToolbarButtons } from "@/editor/ui/toolbars/buttons/floating-toolbar-buttons";

export const FloatingToolbarPlugin = createPlatePlugin({
  key: "floating-toolbar",
  render: {
    afterEditable: () => (
      <FloatingToolbar>
        <FloatingToolbarButtons />
      </FloatingToolbar>
    ),
  },
});
