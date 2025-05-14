"use client";

import { createPlatePlugin } from "@udecode/plate/react";

import { FloatingToolbar } from "@/components/editor/ui/toolbars/floating-toolbar";
import { FloatingToolbarButtons } from "@/components/editor/ui/toolbars/buttons/floating-toolbar-buttons";

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
