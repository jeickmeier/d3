"use client";

import { createPlatePlugin } from "@udecode/plate/react";

import { FixedToolbar } from "../ui/menus/toolbars/fixed/fixed-toolbar";
import { FixedToolbarButtons } from "../ui/menus/toolbars/buttons/fixed-toolbar-buttons";

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
