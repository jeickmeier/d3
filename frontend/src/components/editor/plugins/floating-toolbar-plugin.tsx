"use client";

import { createPlatePlugin } from "@udecode/plate/react";

import { FloatingToolbar } from "../ui/menus/toolbars/floating/floating-toolbar";
import { FloatingToolbarButtons } from "../ui/menus/toolbars/buttons/floating-toolbar-buttons";

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
