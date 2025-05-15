"use client";

import { CursorOverlayPlugin } from "@udecode/plate-selection/react";

import { CursorOverlay } from "../ui/primitives/cursor-overlay";

export const cursorOverlayPlugin = CursorOverlayPlugin.configure({
  render: {
    afterEditable: () => <CursorOverlay />,
  },
});
