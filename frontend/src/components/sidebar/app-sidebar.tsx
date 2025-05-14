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

import { authClient } from "@/lib/auth/auth-client";

// This is sample data.
const data = {
  navMain: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();
  const { data: session, isPending } = authClient.useSession();
  const [isClient, setIsClient] = useState(false);
  const previousSessionRef = React.useRef<typeof session | undefined>(
    undefined,
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (typeof previousSessionRef.current !== "undefined") {
      console.log(
        "AppSidebar: session object reference is the same?",
        previousSessionRef.current === session,
      );
    }
    previousSessionRef.current = session;
  }, [session]);

  console.log("AppSidebar: isPending", isPending);
  console.log(
    "AppSidebar: session content",
    session ? JSON.stringify(session) : String(session),
  );

  const user = React.useMemo(() => {
    if (isPending || !session) {
      return {
        name: "Loading...",
        email: "Please wait",
        image: null,
      };
    }
    return {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      image: session?.user?.image || "",
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
