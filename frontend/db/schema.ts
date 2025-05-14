import {
  text,
  timestamp,
  boolean,
  pgEnum,
  jsonb,
  uniqueIndex,
  integer,
  pgSchema,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const aiSchema = pgSchema("ai");

/// User Schema

export const user = aiSchema.table("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  role: text("role").notNull().default("user"),
});

export const session = aiSchema.table("session", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const account = aiSchema.table("account", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  scope: text("scope").notNull().default("enail"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

/// Organization Schema

export const verification = aiSchema.table("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const organizationType = aiSchema.table("organization_type", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const organization = aiSchema.table("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  logo: text("logo"),
  typeId: text("type_id").references(() => organizationType.id),
  metadata: text("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const member = aiSchema.table("member", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id),
  role: text("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const invitation = aiSchema.table("invitation", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id),
  role: text("role").notNull(),
  status: text("status").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

/// Document Schema

// --- Enums ---
export const textStyleEnum = pgEnum("text_style", ["DEFAULT", "SERIF", "MONO"]);

export const documents = aiSchema.table(
  "documents",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id"),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }), // Correctly references your user table
    parentDocumentId: text("parent_document_id"),

    title: text("title"),
    content: text("content"),
    contentRich: jsonb("content_rich"),
    coverImage: text("cover_image"),
    icon: text("icon"),
    isPublished: boolean("is_published").default(false).notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),

    textStyle: textStyleEnum("text_style").default("DEFAULT").notNull(),
    smallText: boolean("small_text").default(false).notNull(),
    fullWidth: boolean("full_width").default(false).notNull(),
    lockPage: boolean("lock_page").default(false).notNull(),
    toc: boolean("toc").default(true).notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdateFn(() => new Date()),
  },
  (table) => {
    return {
      userIdTemplateIdUnique: uniqueIndex(
        "document_user_id_template_id_unique_idx",
      ).on(table.userId, table.templateId),
    };
  },
);

export const documentVersions = aiSchema.table("document_versions", {
  id: text("id").primaryKey(),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // Correctly references your user table

  title: text("title"),
  contentRich: jsonb("content_rich"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const discussions = aiSchema.table("discussions", {
  id: text("id").primaryKey(),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // Correctly references your user table

  documentContent: text("document_content").notNull(),
  documentContentRich: jsonb("document_content_rich"),
  isResolved: boolean("is_resolved").default(false).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const comments = aiSchema.table("comments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // Correctly references your user table
  discussionId: text("discussion_id")
    .notNull()
    .references(() => discussions.id, { onDelete: "cascade" }),

  content: text("content").notNull(),
  contentRich: jsonb("content_rich"),
  isEdited: boolean("is_edited").default(false).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

export const files = aiSchema.table("files", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }), // Correctly references your user table
  documentId: text("document_id").references(() => documents.id, {
    onDelete: "set null",
  }),

  size: integer("size").notNull(),
  url: text("url").notNull(),
  appUrl: text("app_url").notNull(),
  type: text("type").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

// --- Relations ---

// Add relations for your existing user table if needed
/*
export const usersRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  documents: many(documents),
  documentVersions: many(documentVersions),
  discussions: many(discussions),
  comments: many(comments),
  files: many(files),
  // oauthAccounts: many(oauthAccounts) // If you add an oauthAccounts table
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));
*/

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(user, {
    // Now references your user table
    fields: [documents.userId],
    references: [user.id],
  }),
  parentDocument: one(documents, {
    fields: [documents.parentDocumentId],
    references: [documents.id],
    relationName: "ParentChild",
  }),
  children: many(documents, {
    relationName: "ParentChild",
  }),
  discussions: many(discussions),
  documentVersions: many(documentVersions),
  files: many(files),
}));

export const documentVersionsRelations = relations(
  documentVersions,
  ({ one }) => ({
    document: one(documents, {
      fields: [documentVersions.documentId],
      references: [documents.id],
    }),
    user: one(user, {
      // Now references your user table
      fields: [documentVersions.userId],
      references: [user.id],
    }),
  }),
);

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  document: one(documents, {
    fields: [discussions.documentId],
    references: [documents.id],
  }),
  user: one(user, {
    // Now references your user table
    fields: [discussions.userId],
    references: [user.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(user, {
    // Now references your user table
    fields: [comments.userId],
    references: [user.id],
  }),
  discussion: one(discussions, {
    fields: [comments.discussionId],
    references: [discussions.id],
  }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  user: one(user, {
    // Now references your user table
    fields: [files.userId],
    references: [user.id],
  }),
  document: one(documents, {
    fields: [files.documentId],
    references: [documents.id],
  }),
}));

// --- Supporting Types (Optional, for better type safety in your app) ---
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

export type DocumentVersion = typeof documentVersions.$inferSelect;
export type NewDocumentVersion = typeof documentVersions.$inferInsert;

export type Discussion = typeof discussions.$inferSelect;
export type NewDiscussion = typeof discussions.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
