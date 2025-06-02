"use client";

import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VaultTable } from "@/components/elements/vault-table";
import Deposit from "@/components/icons/deposit";
import Borrow from "@/components/icons/borrow";
import { CustomButton } from "@/components/ui/custom-button";
import { ColumnVisibilityPopover } from "@/components/elements/column-visibility-popover";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/contexts/language-context";
import Link from "next/link";
import { HowEarnWorks } from "./how-earn-works";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axios from "axios";
import { IndexListEntry } from "@/types";
import { setIndices } from "@/redux/indexSlice";
import { fetchAllIndices } from "@/api/indices";

type ColumnType = {
  id: string;
  title: string;
  visible: boolean;
};

const initialColumns: ColumnType[] = [
  { id: "name", title: "Index Name", visible: true },
  { id: "ticker", title: "Ticker", visible: true },
  { id: "totalSupply", title: "Total Supply", visible: true },
  { id: "ytdReturn", title: "YTD return", visible: true },
  { id: "curator", title: "Curator", visible: true },
  { id: "collateral", title: "Collateral", visible: true },
  { id: "managementFee", title: "Management Fee", visible: false },
  { id: "actions", title: "", visible: false },
];

interface EarnContentProps {
  onSupplyClick?: (vaultId: string, token: string) => void;
}

export function EarnContent({ onSupplyClick }: EarnContentProps) {
  const { t } = useLanguage();
  const [columns, setColumns] = useState(initialColumns);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showHowEarnWorks, setShowHowEarnWorks] = useState(false);
  const [totalManaged, setTotalManaged] = useState<number>(0)
  const [totalVolumn, setTotalVolumn] = useState<number>(0)
  const [activeMyearnTab, setActiveMyearnTab] = useState<"position" | "reward">(
    "position"
  );
  const storedWallet = useSelector((state: RootState) => state.wallet.wallet);
  const { selectedNetwork, currentChainId } = useSelector(
    (state: RootState) => state.network
  );

  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [indexLists, setIndexLists] = useState<IndexListEntry[]>([]);
  const [selectedIndexId, setSelectedIndexId] = useState<number | null>(null);

  const storedIndexes = useSelector((state: RootState) => state.index.indices);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchAllIndices()
        const data = response;
        setIndexLists(data || []);
        dispatch(setIndices(data || []))
      } catch (error) {
        console.error("Error fetching performance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (storedIndexes.length === 0) fetchData();
  }, []);

  useEffect(() => {
    const termsAccepted = localStorage.getItem("termsAccepted");
    if ((!termsAccepted || termsAccepted === "false") && storedWallet) {
      setShowHowEarnWorks(true);
    }
  }, [storedWallet]);
  // Function to handle sorting
  const handleSort = (columnId: string, direction: "asc" | "desc") => {
    setSortColumn(columnId);
    setSortDirection(direction);
  };

  // Filter and sort vaults based on search query and sort settings
  const filteredAndSortedVaults = useMemo(() => {
    // First filter by search query
    let filtered = storedIndexes;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();

      filtered = storedIndexes.filter((vault) => {
        // Search in multiple fields
        return (
          vault.name.toLowerCase().includes(query) ||
          vault.ticker.toLowerCase().includes(query) ||
          vault.curator.toLowerCase().includes(query) ||
          vault.totalSupply.toString().toLowerCase().includes(query) ||
          vault.ytdReturn.toString().toLowerCase().includes(query) ||
          vault.managementFee.toString().toLowerCase().includes(query)
        );
      });
    }

    // Then sort the filtered results
    return [...filtered].sort((a, b) => {
      let valueA: number | string;
      let valueB: number | string;

      // Extract the values to compare based on the sort column
      switch (sortColumn) {
        case "name":
          valueA = a.name;
          valueB = b.name;
          break;
        case "ticker":
          valueA = a.ticker;
          valueB = b.ticker;
          break;
        case "totalSupply":
          // Sort by USD value for totalSupply
          valueA = (a.totalSupply);
          valueB = (b.totalSupply);
          break;
        case "curator":
          valueA = a.curator;
          valueB = b.curator;
          break;
        case "managementFee":
          valueA = (a.managementFee);
          valueB = (b.managementFee);
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
  }, [searchQuery, sortColumn, sortDirection, storedIndexes]);
  // Function to handle column visibility changes
  const handleColumnVisibilityChange = (columnId: string, visible: boolean) => {
    setColumns(
      columns.map((column) =>
        column.id === columnId ? { ...column, visible } : column
      )
    );
  };

  const [visibleColumns, setVisibleColumns] = useState<ColumnType[]>([]);
  useEffect(() => {
    if (storedWallet && currentChainId === selectedNetwork) {
      setVisibleColumns(
        columns
          .filter((column) => column.visible)
          .map((column) => ({
            ...column,
          }))
      );
    } else {
      setVisibleColumns(
        columns
          .filter((column) => column.visible && column.id !== "actions")
          .map((column) => ({
            ...column,
          }))
      );
    }
  }, [storedWallet, columns, currentChainId, selectedNetwork]);

  if (showHowEarnWorks) {
    return (
      <div className="bg-foreground border-none border-zinc-800 rounded-lg p-0 -mt-[60px] md:mt-0">
        <HowEarnWorks onClose={() => setShowHowEarnWorks(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative flex h-auto">
      <div className="flex-1 space-y-6 overflow-auto">
        <div className="flex flex-row justify-between">
          <h1 className="text-[38px] text-primary flex items-center">
            {t("common.index")}
          </h1>
          <div className="hidden gap-3 md:flex">
            <Link href={"./analytics"}>
              <Card className="bg-foreground gap-5 border-none cursor-pointer p-5 flex flex-col h-[98px] min-w-[194px] rounded-[12px]">
                <CardHeader className="flex flex-row items-center justify-between p-0 w-full">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-2 w-full">
                      <Deposit className="h-[14px] w-[14px]" />
                      <div className="text-secondary text-[12px]">
                        {t("common.totalDeposits")}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[20px]">
                  <div className="font-normal text-secondary text-[15px] pb-2">
                    ${totalManaged}
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href={"./analytics"}>
              <Card className="bg-foreground gap-5 border-none cursor-pointer p-5 flex flex-col h-[98px] min-w-[194px] rounded-[12px]">
                <CardHeader className="flex flex-row items-center justify-between p-0 w-full">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Borrow className="h-[14px] w-[14px]" />
                      <div className="text-secondary text-[12px]">
                        {t("common.totalBorrow")}
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 h-[20px]">
                  <div className="text-[15px] font-normal text-secondary mb-2">
                    ${totalVolumn}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="space-y-4 mt-20">
          {storedWallet ? (
            <>
              <div className="flex gap-4 md:items-center justify-between flex-wrap">
                <div className="flex items-center gap-4  flex-wrap">
                  <h2 className="text-[16px] font-normal text-card">
                    {t("common.myEarn")}
                  </h2>
                  <div className="flex gap-1 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-secondary px-[8px] py-[5px] h-[26px] text-[11px] rounded-[4px] cursor-pointer hover:text-primary",
                        activeMyearnTab === "position" ? "bg-accent" : "bg-none"
                      )}
                      onClick={() => setActiveMyearnTab("position")}
                    >
                      <span>{t("common.positions")}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "text-secondary px-[8px] py-[5px] h-[26px] text-[11px] rounded-[4px] cursor-pointer  hover:text-primary",
                        activeMyearnTab === "reward" ? "bg-accent " : " bg-none"
                      )}
                      onClick={() => setActiveMyearnTab("reward")}
                    >
                      <span>{t("common.rewards")}</span>
                    </Button>
                  </div>
                </div>
                <div className="gap-4 hidden sm:flex">
                  <CustomButton
                    disabled={true}
                    className="bg-[#2470ff] disabled hover:bg-blue-700 text-[11px] rounded-[3px] cursor-pointer disabled:cursor-default disabled:opacity-30"
                  >
                    {t("common.claim")}
                  </CustomButton>
                  {activeMyearnTab === "position" ? (
                    <ColumnVisibilityPopover
                      columns={columns}
                      onColumnVisibilityChange={handleColumnVisibilityChange}
                    />
                  ) : (
                    <></>
                  )}
                </div>
              </div>
              <div className="p-4 border-none bg-foreground mb-10">
                <p className="text-secondary text-center text-[12px]">
                  {activeMyearnTab === "position"
                    ? t("common.noClaimableRewards")
                    : t("common.noEarnPosition")}
                </p>
              </div>
            </>
          ) : (
            <></>
          )}

          <div className="flex gap-4 md:items-center md:justify-between flex-col md:flex-row flex-wrap">
            <div className="flex items-center gap-4">
              <h2 className="text-[16px] font-normal text-card">
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
                  className="pl-8 !text-[12px] h-[32px] md:w-[150px] text-primary border-[#afafaf1a] focus:border-[#afafaf1a] focus:border-none"
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
            onSupplyClick={onSupplyClick}
          />
        </div>
      </div>
    </div>
  );
}
