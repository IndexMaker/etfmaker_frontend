"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { VaultAllocation } from "@/lib/data";
import { Button } from "../ui/button";
import LeftArrow from "../icons/left-arrow";
import RightArrow from "../icons/right-arrow";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@radix-ui/react-tooltip";
import Info from "../icons/info";
import { useLanguage } from "@/contexts/language-context";

interface VaultAllocationBreakdownProps {
  allocations: VaultAllocation[];
  visibleColumns: { id: string; name: string; visible: boolean }[];
}

export function VaultAllocationBreakdown({
  allocations,
  visibleColumns,
}: VaultAllocationBreakdownProps) {
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVaults = allocations.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(allocations.length / itemsPerPage);

  // Helper function to render collateral icon
  const renderCollateralIcon = (icon?: string) => {
    let bgColor = "bg-gray-500";

    if (icon === "green") bgColor = "bg-green-500";
    if (icon === "yellow") bgColor = "bg-yellow-500";
    if (icon === "red") bgColor = "bg-red-500";

    return <div className={`w-3 h-3 rounded-full ${bgColor} mr-2`}></div>;
  };

  // Helper function to render cell content based on column ID
  const renderCellContent = (allocation: VaultAllocation, columnId: string) => {
    switch (columnId) {
      case "percentage":
        return allocation.percentage;
      case "vaultSupply":
        return (
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <div>{allocation.vaultSupply.amount}</div>
              <div className="text-[11px] bg-accent text-secondary px-[2px] py-1 rounded-[4px]">
                {allocation.vaultSupply.usdValue}
              </div>
              {parseFloat(allocation.percentage) < 0.1 ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="h-4 w-4 text-card rounded-none bg"
                    >
                      <Info className="h-3 w-3 text-primary" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs p-2">
                      <span className="font-bold text-[12px] text-primary">
                        Market has low total supply.
                        <a
                          target="_blank"
                          rel="noreferrer noopener"
                          className="font-normal text-card text-[11px]"
                          href="https://docs.indexmaker.global/interface/warnings/#what-are-the-warnings-on-the-indexmaker-interface"
                        >
                          Learn more →
                        </a>
                      </span>
                    </p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <></>
              )}
            </div>
          </TooltipProvider>
        );
      case "collateral":
        return (
          <div className="flex items-center">
            {renderCollateralIcon(allocation.collateral.icon)}
            <span>{allocation.collateral.name}</span>
          </div>
        );
      case "liquidationLTV":
        return allocation.liquidationLTV;
      case "netAPY":
        return allocation.netAPY;
      case "oracle":
        return allocation.oracle || "—";
      case "supplyCap":
        return allocation.supplyCap || "—";
      case "capPercentage":
        return allocation.capPercentage || "—";
      case "supplyAPY":
        return allocation.supplyAPY || "—";
      case "rewards":
        return allocation.rewards || "—";
      case "totalCollateral":
        return allocation.totalCollateral || "—";
      case "utilization":
        return allocation.utilization || "—";
      case "rateAtUTarget":
        return allocation.rateAtUTarget || "—";
      case "marketId":
        return allocation.marketId || "—";
      default:
        return "—";
    }
  };

  return (
    <>
      <Card className="bg-foreground border-none rounded-[8px] mt-4 py-0 rouneded-[8px]">
        <CardContent className="p-0 overflow-x-auto rouneded-[8px]">
          <Table className="rouneded-[16px]">
            <TableHeader className="bg-foreground">
              <TableRow className="hover:bg-transparent border-[#afafaf1a] h-[44px]">
                {visibleColumns
                  .filter((column) => column.visible)
                  .map((column) => (
                    <TableHead
                      key={column.id}
                      className={cn(
                        "text-secondary text-[11px] pl-[20px] pr-[72px]",
                        column.id === "percentage" && "cursor-pointer"
                      )}
                    >
                      <div className="flex items-center gap-1">
                        {t("table." + column.id)}
                        {column.id === "percentage" && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-zinc-400"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        )}
                      </div>
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentVaults.map((allocation) => (
                <TableRow
                  key={allocation.id}
                  className="border-[#afafaf1a] hover:bg-foreground/50 h-[54px] text-[13px]"
                >
                  {visibleColumns
                    .filter((column) => column.visible)
                    .map((column, index) => (
                      <TableCell
                        className="pl-[20px] text-card pr-18"
                        key={`${allocation.id}-${index}`}
                      >
                        {renderCellContent(allocation, column.id)}
                      </TableCell>
                    ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <div className="flex justify-center items-center mt-4 text-primary text-sx">
        <Button
          className="text-[11px] text-muted bg-background p-0 h-4"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <LeftArrow className="w-4 h-4" />
        </Button>
        <span className="text-[11px] text-muted">
          {t("common.page")} {currentPage} {t("common.of")} {totalPages}
        </span>
        <Button
          className="text-[11px] text-muted bg-background p-0 h-4"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          <RightArrow className="w-[8px] h-[8px] rotate-180 " />
        </Button>
      </div>
    </>
  );
}
