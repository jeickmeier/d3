"use client";

import { authClient } from "@/lib/auth/auth-client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const UserProfile = dynamic(
  () => import("@/components/auth/UserProfile").then((mod) => mod.UserProfile),
  { ssr: false },
);

export default function UserAccountPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    data: session,
    isPending: sessionLoading,
    error: sessionError,
  } = authClient.useSession();

  const {
    data: organizations,
    isPending: orgLoading,
    error: orgError,
  } = authClient.useListOrganizations();

  if (!isClient) {
    return null;
  }

  if (sessionLoading || orgLoading) {
    return null;
  }

  if (sessionError || !session?.user) {
    return <div>Error loading user information</div>;
  }

  if (orgError) {
    return <div>Error loading organization information</div>;
  }

  return (
    <UserProfile
      user={{
        name: session.user.name || null,
        email: session.user.email || null,
        image: session.user.image || null,
        id: session.user.id || null,
      }}
      organizations={organizations || []}
    />
  );
}
