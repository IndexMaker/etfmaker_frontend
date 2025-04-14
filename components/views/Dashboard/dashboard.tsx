"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/layouts/sidebar";
import { Header } from "@/components/layouts/header";
import { EarnContent } from "./earn-content";
import { SupplyPanel } from "@/components/elements/supply-panel";
import { mockup_vaults } from "@/lib/data";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { addSelectedVault, clearSelectedVault } from "@/redux/vaultSlice";
interface DashboardProps {
  children?: React.ReactNode;
}
export default function Dashboard({ children }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightbarOpen, setRightbarOpen] = useState(false);
  const selectedVault = useSelector((state: RootState) => state.vault.selectedVault);
  const dispatch = useDispatch();

  // Function to handle supply button click
  const handleSupplyClick = (vaultId: string, token: string) => {
    dispatch(addSelectedVault({ vaultId, token }));
    // setRightbarOpen(true)
  };

  // Function to close the supply panel
  const handleCloseSupplyPanel = () => {
    dispatch(clearSelectedVault());
  };

  useEffect(() => {
    console.log(selectedVault)
    if (selectedVault.length > 0) {
      setRightbarOpen(true)
    }
    else{
      setRightbarOpen(false)
    }
  }, [selectedVault])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} rightbarOpen={rightbarOpen} setRightbarOpen={setRightbarOpen} />
        <div className="flex flex-row h-full">
          <main className="flex-1 overflow-y-scroll px-[10px] py-20 md:px-10 md:py-20 custom-3xl-padding bg-background">
            {children || <EarnContent onSupplyClick={handleSupplyClick} />}
          </main>
          {selectedVault.length > 0 && (
            <SupplyPanel
              vaultIds={selectedVault}
              onClose={handleCloseSupplyPanel}
              open={rightbarOpen}
              setOpen={setRightbarOpen}
              vaults={mockup_vaults.filter((vault) =>
                selectedVault.map((v) => v.vaultId).includes(vault.id)
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}
