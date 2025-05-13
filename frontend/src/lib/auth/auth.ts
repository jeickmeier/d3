import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@db/db"; // your drizzle instance
import { nextCookies } from "better-auth/next-js";
import { organization } from "better-auth/plugins";
import {
  organization as organizationTable,
  member as memberTable,
} from "@db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
  }),
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 3600,
    },
  },
  account: {
    accountLinking: {
      trustedProviders: ["email-password", "github"],
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID! as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET! as string,
    },
  },

  plugins: [nextCookies(), organization()],
  databaseHooks: {
    user: {
      create: {
        after: async (newUser) => {
          // Automatically add new user to the ALL organization
          try {
            // Find the ALL organization by slug (assuming 'all')
            const allOrg = await db
              .select({ id: organizationTable.id })
              .from(organizationTable)
              .where(eq(organizationTable.slug, "all"))
              .limit(1);
            if (allOrg.length === 0) {
              return;
            }
            const allOrgId = allOrg[0].id;
            // Insert membership record
            await db.insert(memberTable).values({
              id: randomUUID(),
              userId: newUser.id,
              organizationId: allOrgId,
              role: "member",
              createdAt: new Date(),
            });
          } catch (err) {
            console.error("Failed to add new user to ALL organization:", err);
          }
        },
      },
    },
  },
});
