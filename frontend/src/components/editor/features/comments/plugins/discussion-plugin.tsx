"use client";

import type { TComment } from "@comments/ui/elements/comment";

import { createPlatePlugin } from "@udecode/plate/react";

import { BlockDiscussion } from "@comments/ui/elements/block-discussion";
import { COMMENT_TYPES, CommentTypeId } from "@comments/types/comment-types";

export interface TDiscussion {
  id: string;
  comments: TComment[];
  createdAt: Date;
  isResolved: boolean;
  userId: string;
  documentContent?: string;
}

// Options for the discussion plugin
export interface DiscussionPluginOptions {
  discussions: TDiscussion[];
  visibleTypes: CommentTypeId[];
}

// This plugin is purely UI. It's only used to store the discussions and users data
export const discussionPlugin = createPlatePlugin<
  "discussion",
  DiscussionPluginOptions
>({
  key: "discussion",
  options: {
    discussions: [],
    visibleTypes: COMMENT_TYPES.map((t) => t.id),
  },
}).configure({ render: { aboveNodes: BlockDiscussion } });
