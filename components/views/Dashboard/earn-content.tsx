"use client";

import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VaultTable } from "@/components/elements/vault-table";
import Deposit from "@/components/icons/deposit";
import Borrow from "@/components/icons/borrow";
import { CustomButton } from "@/components/ui/custom-button";
import { ColumnVisibilityPopover } from "@/components/elements/column-visibility-popover";
import { useEffect, useState } from "react";

const initialColumns = [
  { id: "vaultName", title: "Vault Name", visible: true },
  { id: "token", title: "Token", visible: true },
  { id: "totalSupply", title: "Total Supply", visible: true },
  { id: "instantApy", title: "Instant APY", visible: true },
  { id: "vaultApy", title: "Vault APY", visible: true },
  { id: "curator", title: "Curator", visible: true },
  { id: "collateral", title: "Collateral", visible: true },
  { id: "rewards", title: "Rewards", visible: true },
  { id: "performanceFee", title: "Performance Fee", visible: false },
];

export function EarnContent() {
  const [columns, setColumns] = useState(initialColumns);

  // Function to handle column visibility changes
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setColumns(
      columns.map((column) =>
        column.id === columnId ? { ...column, visible } : column
      )
    );
  };

  // Get only visible columns
  const [visibleColumns, setvisibleColumns] = useState(initialColumns);
  useEffect(() => {
    setvisibleColumns(columns.filter((column) => column.visible));
  }, [columns]);
  return (
    <div className="space-y-6">
      <div className="flex flex-row justify-between">
        <h1 className="text-[38px] text-white flex items-center">Earn</h1>
        <div className="hidden gap-3 md:flex">
          <Card className="bg-[#202426] gap-5 border-none cursor-pointer p-5 flex flex-col h-[98px] min-w-[194px] rounded-[12px]">
            <CardHeader className="flex flex-row items-center justify-between p-0 w-full">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2 w-full">
                  <Deposit className="h-[14px] w-[14px]" />
                  <div className="text-[#ffffffcc] text-[12px]">
                    Total Deposits
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[20px]">
              <div className="font-normal text-white text-[15px] pb-2">
                $4,736,811,455
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#202426] gap-5 border-none cursor-pointer p-5 flex flex-col h-[98px] min-w-[194px] rounded-[12px]">
            <CardHeader className="flex flex-row items-center justify-between p-0 w-full">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Borrow className="h-[14px] w-[14px]" />
                  <div className="text-[#ffffffcc] text-[12px]">
                    Total Borrow
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[20px]">
              <div className="text-[15px] font-normal text-white mb-2">
                $1,706,255,566
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4 mt-20">
        <div className="flex gap-4 md:items-center md:justify-between flex-col md:flex-row">
          <div className="flex items-center gap-4">
            <h2 className="text-[16px] font-normal text-[#fffffff2]">
              Deposit in a vault
            </h2>
            <CustomButton
              variant="secondary"
              className="h-auto text-[11px] rounded-[2px]"
            >
              How does it work?
            </CustomButton>
          </div>

          <div className="flex items-center gap-2 justify-between">
            <ColumnVisibilityPopover
              columns={columns}
              onColumnVisibilityChange={handleColumnVisibilityChange}
            />
            <div className="relative max-h-[32px]">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground border-[#fafafa14]" />
              <Input
                type="search"
                placeholder="Search vaults..."
                className="pl-8 text-xs h-[32px] md:w-[150px] text-white border-[#afafaf1a] focus:border-[#afafaf1a] focus:border-none"
              />
            </div>
          </div>
        </div>

        <VaultTable visibleColumns={visibleColumns} />
      </div>
    </div>
  );
}
