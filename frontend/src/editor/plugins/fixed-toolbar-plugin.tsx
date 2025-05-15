"use client";

import { createPlatePlugin } from "@udecode/plate/react";

import { FixedToolbar } from "@/editor/ui/toolbars/fixed/fixed-toolbar";
import { FixedToolbarButtons } from "@/editor/ui/toolbars/buttons/fixed-toolbar-buttons";

export const FixedToolbarPlugin = createPlatePlugin({
  key: "fixed-toolbar",
  render: {
    beforeEditable: () => (
      <FixedToolbar>
        <FixedToolbarButtons />
      </FixedToolbar>
    ),
  },
});
