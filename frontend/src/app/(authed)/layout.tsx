import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { BreadcrumbNav } from "@/components/sidebar/breadcrumb-nav";

import { Separator } from "@/components/ui/separator";
import "@/app/globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-8 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-8">
          <div className="flex items-center gap-1 px-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-1 h-3" />
            <BreadcrumbNav />
          </div>
        </header>

        <Separator className="mb-2" />

        <div className="flex flex-1 flex-col gap-2 p-2 h-full w-full min-w-full overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
