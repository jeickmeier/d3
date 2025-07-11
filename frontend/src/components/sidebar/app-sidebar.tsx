"use client";

import * as React from "react";
import { useEffect, useState } from "react";

import { Menu } from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import { useSharedSession } from "@/lib/auth/use-shared-session";

// Define typed session interface to avoid unsafe any
interface UserSession {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
}

// This is sample data.
const data = {
  navMain: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  const sessionState = useSharedSession();
  const isPending = sessionState.status === "loading";
  const session: UserSession | null =
    sessionState.status === "ready" ? (sessionState.data as UserSession) : null;
  const [isClient, setIsClient] = useState(false);
  const previousSessionRef = React.useRef<UserSession | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    previousSessionRef.current = session;
  }, [session]);

  const user = React.useMemo(() => {
    if (isPending || !session) {
      return {
        name: "Loading...",
        email: "Please wait",
        image: null,
      };
    }
    return {
      name: session.user.name || "",
      email: session.user.email || "",
      image: session.user.image || "",
    };
  }, [session, isPending]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-center">
          {!open ? <Menu className="h-5 w-5" /> : <span></span>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {isClient && !isPending && session ? (
          <NavUser user={user} />
        ) : (
          <div>Loading User...</div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
