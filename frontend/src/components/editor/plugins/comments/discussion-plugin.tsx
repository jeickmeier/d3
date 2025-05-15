"use client";

import type { TComment } from "../../ui/elements/comments-suggestions/comment";

import { createPlatePlugin } from "@udecode/plate/react";

import { BlockDiscussion } from "../../ui/elements/comments-suggestions/block-discussion";
import {
  discussionsData,
  usersData as importedUsersData,
} from "../../lib/discussion-data";

export interface TDiscussion {
  id: string;
  comments: TComment[];
  createdAt: Date;
  isResolved: boolean;
  userId: string;
  documentContent?: string;
}

// Define an explicit options type for the plugin
export interface DiscussionPluginOptions {
  currentUserId?: string; // currentUserId is now optional
  discussions: TDiscussion[];
  users: Record<
    string,
    { id: string; avatarUrl: string; name: string; hue?: number }
  >;
}

// Export importedUsersData
export { importedUsersData };

// This plugin is purely UI. It's only used to store the discussions and users data
export const discussionPlugin = createPlatePlugin({
  key: "discussion",
  options: {
    currentUserId: "bob", // Default to alice if not overridden by useCreateEditor
    discussions: discussionsData,
    users: importedUsersData,
  },
})
  .configure({
    render: { aboveNodes: BlockDiscussion },
  })
  .extendSelectors(({ getOption }) => ({
    currentUser: () => {
      // The getOption will retrieve the overridden value if currentUser was passed to useCreateEditor,
      // otherwise, it will use the plugin's default 'alice'.
      const currentUserId = getOption("currentUserId", "bob");
      const allUsers = getOption("users");
      const currentUserObject = allUsers[currentUserId];
      return currentUserObject;
    },
    user: (id: string) => getOption("users")[id],
  }));
