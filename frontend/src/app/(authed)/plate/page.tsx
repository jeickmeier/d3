"use client"; // Make it a client component

import { Toaster } from "sonner";
import { useEffect, useState, useMemo } from "react"; // Import useMemo

import { PlateEditor } from "@/components/editor/plate-editor";
import { SettingsProvider } from "@/components/editor/settings";
import { authClient } from "@/lib/auth/auth-client";

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    data: session,
    isPending: sessionLoading,
    error: sessionError,
  } = authClient.useSession();

  // Memoize currentUser to prevent unnecessary re-renders of PlateEditor
  const currentUser = useMemo(() => {
    return session?.user
      ? {
          id: session.user.id,
          name: session.user.name ?? undefined,
          avatarUrl: session.user.image ?? undefined,
        }
      : undefined;
  }, [session?.user]); // Dependency is session.user

  if (!isClient || sessionLoading) {
    // You might want a proper loading spinner here
    return null;
  }

  if (sessionError) {
    // Handle error, maybe redirect to login or show an error message
    console.error("[Page] Error fetching session on client:", sessionError);
    return <div>Error loading session. Please try logging in again.</div>;
  }

  // If session is loaded but no user, could be an issue or just logged out state
  // Depending on app logic, might redirect or show a login prompt
  if (!session?.user && !sessionLoading) {
    console.error("[Page] No user in session on client.");
    // return <div>Please log in to use the editor.</div>;
  }

  return (
    <div className="h-screen w-full" data-registry="plate">
      <SettingsProvider>
        {/* Pass the potentially undefined currentUser, PlateEditor/useCreateEditor handles the default */}
        <PlateEditor currentUser={currentUser} />
      </SettingsProvider>

      <Toaster />
    </div>
  );
}
