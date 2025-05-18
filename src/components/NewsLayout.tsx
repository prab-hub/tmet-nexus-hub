
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import NewsSidebar from "./NewsSidebar";

interface NewsLayoutProps {
  children: React.ReactNode;
}

const NewsLayout = ({ children }: NewsLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <NewsSidebar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default NewsLayout;
