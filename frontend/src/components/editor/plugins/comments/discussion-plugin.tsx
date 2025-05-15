"use client";

import type { TComment } from "../../ui/elements/comments-suggestions/comment";

import { createPlatePlugin } from "@udecode/plate/react";

import { BlockDiscussion } from "../../ui/elements/comments-suggestions/block-discussion";

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
}

// This plugin is purely UI. It's only used to store the discussions and users data
export const discussionPlugin = createPlatePlugin<
  "discussion",
  DiscussionPluginOptions
>({
  key: "discussion",
  options: {
    discussions: [],
  },
}).configure({ render: { aboveNodes: BlockDiscussion } });
