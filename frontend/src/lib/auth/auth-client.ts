import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL!,
  plugins: [organizationClient()],
});

export const { signUp, signIn, signOut, useSession, getSession } = authClient;
