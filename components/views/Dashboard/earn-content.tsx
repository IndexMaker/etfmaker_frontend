"use client";

import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VaultTable } from "@/components/elements/vault-table";
import Deposit from "@/components/icons/deposit";
import Borrow from "@/components/icons/borrow";
import { CustomButton } from "@/components/ui/custom-button";
import { ColumnVisibilityPopover } from "@/components/elements/column-visibility-popover";
import { useMemo, useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import { vaults } from "@/lib/data";
import Link from "next/link";

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
  const { t } = useLanguage();
  const [columns, setColumns] = useState(initialColumns);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("vaultName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [, setShowHowEarnWorks] = useState(false);

  // Function to handle sorting
  const handleSort = (columnId: string, direction: "asc" | "desc") => {
    setSortColumn(columnId);
    setSortDirection(direction);
  };

  // Filter and sort vaults based on search query and sort settings
  const filteredAndSortedVaults = useMemo(() => {
    // First filter by search query
    let filtered = vaults;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      filtered = vaults.filter((vault) => {
        // Search in multiple fields
        return (
          vault.name.toLowerCase().includes(query) ||
          vault.token.toLowerCase().includes(query) ||
          vault.curator.toLowerCase().includes(query) ||
          vault.totalSupply.toLowerCase().includes(query) ||
          vault.instantApy.toLowerCase().includes(query) ||
          vault.performanceFee.toLowerCase().includes(query) ||
          vault.vaultApy.toLowerCase().includes(query) ||
          vault.rewards.toLowerCase().includes(query)
        );
      });
    }

    // Then sort the filtered results
    return [...filtered].sort((a, b) => {
      let valueA: number | string;
      let valueB: number | string;

      // Extract the values to compare based on the sort column
      switch (sortColumn) {
        case "vaultName":
          valueA = a.name;
          valueB = b.name;
          break;
        case "totalSupply":
          // Sort by USD value for totalSupply
          valueA = Number.parseFloat(a.totalSupply.replace(/[^0-9.-]+/g, ""));
          valueB = Number.parseFloat(b.totalSupply.replace(/[^0-9.-]+/g, ""));
          break;
        case "instantApy":
          valueA = Number.parseFloat(a.instantApy);
          valueB = Number.parseFloat(b.instantApy);
          break;
        case "vaultApy":
          valueA = Number.parseFloat(a.vaultApy);
          valueB = Number.parseFloat(b.vaultApy);
          break;
        case "curator":
          valueA = a.curator;
          valueB = b.curator;
          break;
        case "rewards":
          valueA = a.rewards;
          valueB = b.rewards;
          break;
        case "performanceFee":
          valueA = Number.parseFloat(a.performanceFee);
          valueB = Number.parseFloat(b.performanceFee);
          break;
        default:
          valueA = a.name;
          valueB = b.name;
      }

      // Compare the values based on sort direction
      if (valueA < valueB) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [searchQuery, sortColumn, sortDirection]);
  // Function to handle column visibility changes
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setColumns(
      columns.map((column) =>
        column.id === columnId ? { ...column, visible } : column
      )
    );
  };

  const visibleColumns = columns
    .filter((column) => column.visible)
    .map((column) => ({
      ...column,
      // translatedTitle: t(column.title),
    }));



  return (
    <div className="space-y-6">
      <div className="flex flex-row justify-between">
        <h1 className="text-[38px] text-white flex items-center">
          {t("common.earn")}
        </h1>
        <div className="hidden gap-3 md:flex">
          <Link href={"./analytics"}>
            <Card className="bg-[#202426] gap-5 border-none cursor-pointer p-5 flex flex-col h-[98px] min-w-[194px] rounded-[12px]">
              <CardHeader className="flex flex-row items-center justify-between p-0 w-full">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  <div className="flex items-center gap-2 w-full">
                    <Deposit className="h-[14px] w-[14px]" />
                    <div className="text-[#ffffffcc] text-[12px]">
                      {t("common.totalDeposits")}
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
          </Link>

          <Link href={"./analytics"}>
            <Card className="bg-[#202426] gap-5 border-none cursor-pointer p-5 flex flex-col h-[98px] min-w-[194px] rounded-[12px]">
              <CardHeader className="flex flex-row items-center justify-between p-0 w-full">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Borrow className="h-[14px] w-[14px]" />
                    <div className="text-[#ffffffcc] text-[12px]">
                      {t("common.totalBorrow")}
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
          </Link>
        </div>
      </div>

      <div className="space-y-4 mt-20">
        <div className="flex gap-4 md:items-center md:justify-between flex-col md:flex-row">
          <div className="flex items-center gap-4">
            <h2 className="text-[16px] font-normal text-[#fffffff2]">
              {t("common.depositInVault")}
            </h2>
            <CustomButton
              variant="secondary"
              className="h-auto text-[11px] rounded-[2px]"
              onClick={() => setShowHowEarnWorks(true)}
            >
              {t("common.howDoesItWork")}
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
                placeholder={t("common.searchVaults")}
                className="pl-8 text-xs h-[32px] md:w-[150px] text-white border-[#afafaf1a] focus:border-[#afafaf1a] focus:border-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <VaultTable
          visibleColumns={visibleColumns}
          vaults={filteredAndSortedVaults}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
        />
      </div>
    </div>
  );
}
