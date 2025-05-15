"use client";

import {
  MarkdownPlugin,
  remarkMdx,
  remarkMention,
} from "@udecode/plate-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export const markdownPlugin = MarkdownPlugin.configure({
  options: {
    remarkPlugins: [remarkMath, remarkGfm, remarkMdx, remarkMention],
  },
});
