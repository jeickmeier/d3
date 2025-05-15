"use client";

import { CodePlugin, SkipMarkPlugin } from "@udecode/plate-basic-marks/react";
import { CommentsPlugin } from "@udecode/plate-comments/react";

export const skipMarkPlugin = SkipMarkPlugin.configure({
  options: {
    query: {
      allow: [CodePlugin.key, CommentsPlugin.key],
    },
  },
});
