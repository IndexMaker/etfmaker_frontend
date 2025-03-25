"use client";

import { Copy, BarChart2, Info } from "lucide-react";
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
import vaults from "@/lib/data";
import CustomTooltip from "./custom-tooltip";
import { useState } from "react";
import RightArrow from "../icons/right-arrow";
import LeftArrow from "../icons/left-arrow";

interface VaultTableProps {
  visibleColumns: { id: string; title: string; visible: boolean }[];
}

export function VaultTable({ visibleColumns }: VaultTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVaults = vaults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(vaults.length / itemsPerPage);
  return (
    <TooltipProvider>
      <div className="rounded-sm">
        <Table className="text-white text-xs bg-[#202426]">
          <TableHeader className="text-white border-[#afafaf1a]">
            <TableRow className="text-white hover:bg-[#fafafa1a] border-[#afafaf1a]">
              {visibleColumns
                .filter((col) => col.visible)
                .map((col) => (
                  <TableHead key={col.id} className="text-[#ffffffcc]">
                    {col.title}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentVaults.map((vault) => (
              <TableRow
                key={vault.id}
                className="hover:bg-[#fafafa1a] border-[#afafaf1a] h-[54px] text-[13px]"
              >
                {visibleColumns.map(
                  (col) =>
                    col.visible && (
                      <TableCell key={col.id}>
                        {col.id === "vaultName" && (
                          <>
                            <div className="flex items-center gap-2 pl-2">
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
                            <span>{vault.token}</span>
                          </div>
                        )}
                        {col.id === "totalSupply" && (
                          <div className="flex items-center">
                            <div>{vault.totalSupply}</div>
                            <div className="text-white p-1 ml-2 bg-[#afafaf1a] text-xs">
                              {vault.totalSupplyUsd}
                            </div>
                          </div>
                        )}
                        {col.id === "instantApy" && (
                          <div className="flex items-center gap-1 cursor-pointer">
                            {vault.instantApy}
                            {vault.id >= 2 && (
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
