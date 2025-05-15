"use client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ContactsProvider } from "@/contexts/ContactsContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <ContactsProvider>
        <SidebarProvider>
          <AppSidebar />
          <main className="h-screen flex-1 overflow-hidden">
            <SidebarTrigger />

            {children}
          </main>
        </SidebarProvider>
      </ContactsProvider>
    </WorkspaceProvider>
  );
}
