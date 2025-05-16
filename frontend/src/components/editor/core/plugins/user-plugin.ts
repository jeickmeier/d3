"use client";

import { createPlatePlugin } from "@udecode/plate/react";

export interface UserPluginOptions {
  currentUserId?: string;
  users: Record<
    string,
    { id: string; avatarUrl: string; name: string; hue?: number }
  >;
}

export const userPlugin = createPlatePlugin({
  key: "user",
  options: {
    currentUserId: undefined,
    users: {} as Record<
      string,
      { id: string; avatarUrl: string; name: string; hue?: number }
    >,
  },
}).extendSelectors(({ getOption }) => ({
  currentUser: () => {
    const id = getOption("currentUserId", undefined);
    const allUsers = getOption("users");
    return id && allUsers ? allUsers[id] : undefined;
  },
  user: (userId: string) => {
    const allUsers = getOption("users");
    return allUsers[userId];
  },
}));
