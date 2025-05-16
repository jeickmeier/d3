"use client"; // Make it a client component

import { Toaster } from "sonner";
import { useEffect, useState, useMemo } from "react"; // Import useMemo

import { PlateEditor } from "@/components/editor/plate-editor";
import { SettingsProvider } from "@/components/editor/settings/settings";
import { CommentsSidebarProvider } from "@/components/editor/features/comments/CommentsSidebarContext";
// import { CommentsSidebar } from "@/components/editor/ui/sidebars/CommentsSidebar"; // Removed import
import { useSharedSession } from "@/lib/auth/use-shared-session";

export default function Page() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sessionState = useSharedSession();

  const sessionLoading = sessionState.status === "loading";
  const sessionError =
    sessionState.status === "error" ? sessionState.error : null;
  const session = sessionState.status === "ready" ? sessionState.data : null;

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

  if (sessionError && Object.keys(sessionError).length > 0) {
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
      <CommentsSidebarProvider>
        <SettingsProvider>
          {/* Pass the potentially undefined currentUser */}
          <PlateEditor currentUser={currentUser} />
        </SettingsProvider>
      </CommentsSidebarProvider>

      <Toaster />
    </div>
  );
}
