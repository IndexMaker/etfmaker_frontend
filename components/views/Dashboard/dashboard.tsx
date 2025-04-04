"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layouts/sidebar";
import { Header } from "@/components/layouts/header";
import { EarnContent } from "./earn-content";
import { SupplyPanel } from "@/components/elements/supply-panel";
// import { useTheme } from "next-themes";
import { mockup_vaults } from "@/lib/data";
interface DashboardProps {
  children?: React.ReactNode;
}
export default function Dashboard({ children }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightbarOpen, setRightbarOpen] = useState(false);
  const [selectedVault, setSelectedVault] = useState<string | null>(null);

  // Function to handle supply button click
  const handleSupplyClick = (vaultId: string) => {
    setSelectedVault(vaultId);
  };

  // Function to close the supply panel
  const handleCloseSupplyPanel = () => {
    setSelectedVault(null);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} rightbarOpen={rightbarOpen} setRightbarOpen={setRightbarOpen} />
        <div className="flex flex-row h-full">
          <main className="flex-1 overflow-y-scroll px-[10px] py-20 md:px-10 md:py-20 custom-3xl-padding bg-background">
            {children || <EarnContent onSupplyClick={handleSupplyClick} />}
          </main>
          {selectedVault && (
            <SupplyPanel
              vaultId={selectedVault}
              onClose={handleCloseSupplyPanel}
              open={rightbarOpen}
              setOpen={setRightbarOpen}
              vault={mockup_vaults.find((v) => v.id === selectedVault)!}
            />
          )}
        </div>
      </div>
    </div>
  );
}
