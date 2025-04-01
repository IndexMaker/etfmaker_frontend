"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layouts/sidebar";
import { Header } from "@/components/layouts/header";
import { EarnContent } from "./earn-content";
// import { useTheme } from "next-themes";
interface DashboardProps {
  children?: React.ReactNode;
}
export default function Dashboard({ children }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const { theme } = useTheme();
  // const [mounted, setMounted] = useState(false);
  // // Avoid hydration mismatch by only rendering after mount
  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto px-[10px] py-20 md:px-10 md:py-20 custom-3xl-padding bg-background">
          {children || <EarnContent />}
        </main>
      </div>
    </div>
  );
}
