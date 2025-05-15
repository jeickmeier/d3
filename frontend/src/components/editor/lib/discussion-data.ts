import type { TDiscussion } from "../plugins/comments/discussion-plugin";

export const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/glass/svg?seed=${seed}`;

export const usersData: Record<
  string,
  { id: string; avatarUrl: string; name: string; hue?: number }
> = {
  alice: {
    id: "alice",
    avatarUrl: avatarUrl("alice6"),
    name: "Alice",
  },
  bob: {
    id: "bob",
    avatarUrl: avatarUrl("bob4"),
    name: "Bob",
  },
  charlie: {
    id: "jeickmeier",
    avatarUrl: avatarUrl("charlie2"),
    name: "Jon Eickmeier",
  },
};

export const discussionsData: TDiscussion[] = [];
