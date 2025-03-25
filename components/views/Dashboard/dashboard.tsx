"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layouts/sidebar";
import { Header } from "@/components/layouts/header";
import { EarnContent } from "./earn-content";
interface DashboardProps {
  children?: React.ReactNode;
}
export default function Dashboard({ children }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto px-10 py-20 xl:px-10 xl:py-20 2xl:px-50 bg-[#15181a]">
          {children || <EarnContent />}
        </main>
      </div>
    </div>
  );
}
