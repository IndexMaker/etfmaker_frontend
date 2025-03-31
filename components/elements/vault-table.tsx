"use client";

import { Copy, BarChart2, Info, ArrowUp, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import InstantAPY from "../icons/instantApy";
import Image from "next/image";
import { VaultInfo } from "@/lib/data";
import CustomTooltip from "./custom-tooltip";
import { useState } from "react";
import RightArrow from "../icons/right-arrow";
import LeftArrow from "../icons/left-arrow";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";

interface VaultTableProps {
  visibleColumns: {
    id: string;
    title: string;
    visible: boolean;
  }[];
  vaults: VaultInfo[];
  onSort?: (columnId: string, direction: "asc" | "desc") => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
}

export function VaultTable({
  visibleColumns,
  vaults,
  onSort,
  sortColumn,
  sortDirection,
}: VaultTableProps) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const router = useRouter();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVaults = vaults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(vaults.length / itemsPerPage);

  // Function to handle column header click for sorting
  const handleSort = (columnId: string) => {
    if (onSort) {
      // If already sorting by this column, toggle direction
      if (sortColumn === columnId) {
        onSort(columnId, sortDirection === "asc" ? "desc" : "asc");
      } else {
        // Default to ascending for new sort column
        onSort(columnId, "asc");
      }
    }
  };

  const assetDetail = (vault: VaultInfo) => {
    router.push("./vault/" + vault?.id);
  };

  // Determine if a column is sortable
  const isSortable = (columnId: string) => {
    // Add all sortable columns here
    return [
      "vaultName",
      "totalSupply",
      "supplyAPY",
      "curator",
      "rewards",
      "performanceFee",
    ].includes(columnId);
  };

  return (
    <TooltipProvider>
      <div className="">
        <Table className="text-white text-xs bg-[#202426] rounded-[8px]">
          <TableHeader className="text-white border-[#afafaf1a]">
            <TableRow className="text-white hover:bg-[#fafafa1a] border-[#afafaf1a]">
              {visibleColumns
                .filter((col) => col.visible)
                .map((col) => (
                  <TableHead
                    key={col.id}
                    className={
                      isSortable(col.id)
                        ? "cursor-pointer select-none text-[#ffffffcc] text-[11px] h-[44px] pl-5 pr-18 min-w-[180px]"
                        : "text-[#ffffffcc] text-[11px] h-[44px] pl-5 pr-18 min-w-[180px]"
                    }
                    onClick={
                      isSortable(col.id) ? () => handleSort(col.id) : undefined
                    }
                  >
                    <div className="flex items-center gap-1">
                      {
                        <span>
                          {col.id === "instantApy"
                            ? t("table.netAPY")
                            : col.id === "vaultApy"
                            ? t("table.supplyAPY")
                            : t("table." + col.id)}
                        </span>
                      }
                      {isSortable(col.id) && (
                        <span className="ml-1 h-3 w-3 hover:flex">
                          {sortColumn === col.id ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="h-3 w-3 text-zinc-400" />
                            ) : (
                              <ArrowDown className="h-3 w-3 text-zinc-400 opacity-30" />
                            )
                          ) : (
                            <ArrowDown className="h-3 w-3 text-zinc-400 opacity-30 " />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentVaults.map((vault: VaultInfo, index) => (
              <TableRow
                key={vault.id}
                className="hover:bg-[#fafafa1a] border-[#afafaf1a] h-[54px] text-[13px] cursor-pointer"
                onClick={() => assetDetail(vault)}
              >
                {visibleColumns.map(
                  (col) =>
                    col.visible && (
                      <TableCell
                        key={col.id}
                        className="pl-5 pr-18 text-[#fffffff2]"
                      >
                        {col.id === "vaultName" && (
                          <>
                            <div className="flex items-center gap-2 pl-[1.5px]">
                              <Image
                                src={`https://cdn.morpho.org/assets/logos/${vault.token.toLocaleLowerCase()}.svg`}
                                alt={vault.token}
                                width={17}
                                height={17}
                              />
                              <span>{vault.name}</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4"
                                  >
                                    <Info className="h-3 w-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">
                                    Additional information about this vault
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </>
                        )}
                        {col.id === "token" && (
                          <div className="flex items-center gap-2">
                            <Image
                              src={`https://cdn.morpho.org/assets/logos/${vault.token.toLocaleLowerCase()}.svg`}
                              alt={vault.token}
                              width={17}
                              height={17}
                            />
                            <span className="text-[#fffffff2]">
                              {vault.token}
                            </span>
                          </div>
                        )}
                        {col.id === "totalSupply" && (
                          <div className="flex items-center">
                            <div>{vault.totalSupply}</div>
                            <div className="text-[#fffffff2] p-1 ml-2 bg-[#afafaf1a] text-xs">
                              {vault.totalSupplyUsd}
                            </div>
                          </div>
                        )}
                        {col.id === "instantApy" && (
                          <div className="flex items-center gap-1 cursor-pointer">
                            {vault.instantApy}
                            {index >= 2 && (
                              <CustomTooltip
                                key={"instantApy"}
                                content={
                                  <div className="flex flex-col gap-1 min-w-[220px]">
                                    <div className="flex justify-between border-b py-1 px-3 border-[#afafaf1a]">
                                      <span className="text-sm">
                                        Rate & Rewards
                                      </span>
                                    </div>
                                    <div className="flex justify-between border-b py-1 px-3 border-[#afafaf1a]">
                                      <div className="flex items-center gap-1">
                                        <BarChart2 className="h-4 w-4" />
                                        <span>Rate</span>
                                      </div>
                                      <span>+5.25%</span>
                                    </div>
                                    <div className="flex justify-between border-b py-1 px-3 border-[#afafaf1a]">
                                      <div className="flex items-center gap-1">
                                        <Image
                                          src={`https://cdn.morpho.org/assets/logos/usdc.svg`}
                                          alt={vault.token}
                                          width={14}
                                          height={14}
                                        />
                                        <span className="text-xs">Morpho</span>
                                        <Copy className="w-[15px] h-[15px] " />
                                      </div>
                                      <span className="font-bold">+1.16%</span>
                                    </div>
                                    <div className="flex justify-between border-b py-1 px-3 border-[#afafaf1a]">
                                      <div className="flex items-center">
                                        <InstantAPY className="w-[17px] h-[17px]" />
                                        <span className="text-[#2470FFe6]">
                                          Morpho
                                        </span>
                                      </div>
                                      <span className="font-bold text-[#2470FFe6]">
                                        = 6.41%
                                      </span>
                                    </div>
                                  </div>
                                }
                              >
                                <span className="text-xs text-blue-400">
                                  <InstantAPY className="w-[15px] h-[15px] hover:transition-all" />
                                </span>
                              </CustomTooltip>
                            )}
                          </div>
                        )}
                        {col.id === "vaultApy" && vault.vaultApy}
                        {col.id === "curator" && (
                          <div className="flex items-center gap-2">
                            <span>{vault.curatorIcon}</span>
                            <span>{vault.curator}</span>
                          </div>
                        )}
                        {col.id === "collateral" && (
                          <div className="flex items-left gap-0 min-w-[150px]">
                            {vault.collateral.length > 0 ? (
                              vault.collateral.map((collateral, index) => (
                                <CustomTooltip
                                  key={index.toString()}
                                  content={
                                    <div className="flex flex-col gap-1 min-w-[220px]">
                                      <div className="flex justify-between border-b py-1 px-3 border-[#afafaf1a]">
                                        <span>Collateral</span>
                                        <div className="flex items-center">
                                          <Image
                                            src={`https://cdn.morpho.org/assets/logos/usdc.svg`}
                                            alt={vault.token}
                                            width={17}
                                            height={17}
                                          />
                                          <span>PT-U...025</span>
                                        </div>
                                      </div>
                                      <div className="flex justify-between border-b py-1 px-3 border-[#afafaf1a]">
                                        <span>LLTV</span>
                                        <span className="font-bold">91.5%</span>
                                      </div>
                                      <div className="flex justify-between border-b py-1 px-3 border-[#afafaf1a]">
                                        <span className="">Oracle</span>
                                        <a
                                          target="_blank"
                                          href="https://etherscan.io/address/0xDddd770BADd886dF3864029e4B377B5F6a2B6b83"
                                          className="hover:bg-[afafaf20]"
                                        >
                                          Exchange rate
                                        </a>
                                        <Copy className="w-[15px] h-[15px]" />
                                      </div>
                                    </div>
                                  }
                                >
                                  <span className="hover:px-1 hover:transition-all">
                                    {collateral}
                                  </span>
                                </CustomTooltip>
                              ))
                            ) : (
                              <></>
                            )}
                          </div>
                        )}
                        {col.id === "rewards" && vault.rewards}
                        {col.id === "performanceFee" && vault.performanceFee}
                      </TableCell>
                    )
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-center items-center mt-4 text-white text-sx">
          <Button
            className="text-xs text-[#ffffff80] p-0 h-4"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <LeftArrow className="w-4 h-4" />
          </Button>
          <span className="text-xs text-[#ffffff80]">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            className="text-xs text-[#ffffff80] p-0 h-4"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <RightArrow className="w-[8px] h-[8px] rotate-180" />
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
