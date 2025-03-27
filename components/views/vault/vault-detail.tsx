"use client";

import type React from "react";

import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle,
  Copy,
  Eye,
  EyeOff,
  FileText,
  HelpCircle,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Vault } from "@/lib/types/vault";
import { useState } from "react";
import Dashboard from "../Dashboard/dashboard";
import { useLanguage } from "@/contexts/language-context";
import { DocumentUploader } from "./document-uploader";
import { toast } from "sonner";
import { VaultAllocationBreakdown } from "@/components/elements/vault-allocation-breakdown";
import { vaultAllocations } from "@/lib/data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Input } from "@/components/ui/input";
import { CustomButton } from "@/components/ui/custom-button";
interface VaultDetailPageProps {
  vault: Vault;
}

export function VaultDetailPage({ vault }: VaultDetailPageProps) {
  const { t } = useLanguage();
  const [showUploader, setShowUploader] = useState(false);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast(type + " copied to clipboard.", {
      position: "top-right",
      icon: <CheckCircle />,
    });
  };

  // Default visible columns
  const [visibleColumns, setVisibleColumns] = useState<any[]>([
    { id: "percentage", name: "Allocation %", visible: true },
    { id: "vaultSupply", name: "Vault Supply", visible: true },
    { id: "collateral", name: "Collateral", visible: true },
    { id: "netAPY", name: "Net APY", visible: true },
    { id: "oracle", name: "Oracle", visible: true },
    { id: "supplyCap", name: "Supply Cap", visible: true },
    { id: "capPercentage", name: "Cap %", visible: true },
    { id: "supplyAPY", name: "Supply APY", visible: true },
    { id: "rewards", name: "Rewards", visible: true },
    { id: "totalCollateral", name: "Total Collateral", visible: true },
    { id: "utilization", name: "Utilization", visible: true },
    { id: "rateAtUTarget", name: "Rate at uTarget", visible: true },
    { id: "marketId", name: "Market ID", visible: true },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const toggleColumnVisibility = (columnId: string, visible: boolean) => {
    console.log(visibleColumns);
    setVisibleColumns(
      visibleColumns.map((column) =>
        column.id === columnId ? { ...column, visible } : column
      )
    );
  };

  const filteredColumns = visibleColumns.filter((column) =>
    column.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dashboard>
      <div className="md:pl-[86px] md:pr-[86px] md:mt-9">
        {/* Vault Header */}
        <div className="flex flex-col md:flex-row gap-16">
          <div className="flex flex-col md:flex-row items-center gap-8 flex-nowrap">
            <div className="h-[100px] w-[100px] rounded-full overflow-hidden bg-transparent p-[6.6px] flex items-center justify-center">
              {vault.icon ? (
                <img
                  src={vault.icon || "/placeholder.svg"}
                  alt={vault.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="text-4xl">{vault.token.symbol.charAt(0)}</div>
              )}
            </div>
            <div className="flex gap-4 flex-col">
              <h1 className="text-[38px] min-w-[400px] h-[44px] text-white">
                {vault.name}
              </h1>
              <div className="flex items-center gap-4 mt-2 justify-center md:justify-start">
                <div className="flex items-center gap-2">
                  <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-transparent flex items-center justify-center">
                    {vault.token.icon ? (
                      <img
                        src={
                          vault.token.icon ||
                          `https://cdn.morpho.org/assets/logos/${vault.token.symbol}.svg`
                        }
                        alt={vault.token.symbol}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-xs text-white">
                        {vault.token.symbol.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-[#ffffffcc] text-[20px]">
                    {vault.token.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-transparent flex items-center justify-center">
                    {vault.curator.icon ? (
                      <img
                        src={
                          vault.curator.icon ||
                          `https://cdn.morpho.org/assets/logos/mevcapital.png`
                        }
                        alt={vault.curator.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-xs">
                        {vault.curator.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-[#ffffffcc] text-[20px]">
                    {vault.curator.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Vault Description */}
          <div className="bg-[#202426] rounded-sm p-5 border border-zinc-800 flex items-center">
            <p className="text-zinc-300 text-[13px]">{vault.description}</p>
          </div>
        </div>

        {/* Vault Info */}
        <div className="pt-20">
          <h2 className="text-[20px] mb-4 text-white font-custom">
            Vault Info
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Curator */}
            <InfoCard title="Curator">
              <div className="flex items-center gap-2">
                <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                  {vault.curator.icon ? (
                    <img
                      src={vault.curator.icon || "/placeholder.svg"}
                      alt={vault.curator.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-xs">
                      {vault.curator.name.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-white text-[15px] font-normal">
                  {vault.curator.name}
                </span>
                {vault.curator.url && (
                  <Link
                    href={vault.curator.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                  </Link>
                )}
              </div>
            </InfoCard>

            {/* Token */}
            <InfoCard title="Token">
              <div className="flex items-center gap-2">
                <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                  {vault.token.icon ? (
                    <img
                      src={vault.token.icon || "/placeholder.svg"}
                      alt={vault.token.symbol}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="text-xs">
                      {vault.token.symbol.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="text-white text-[15px] font-normal">
                  {vault.token.symbol}
                </span>
                {vault.token.address && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-transparent hover:text-white cursor-pointer"
                    onClick={() =>
                      copyToClipboard(
                        vault.token.address || "",
                        "Token address"
                      )
                    }
                  >
                    <Copy className="h-3 w-3 text-zinc-400 hover:text-white" />
                  </Button>
                )}
              </div>
            </InfoCard>

            {/* Total Supply */}
            <InfoCard title="Total Supply">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                    {vault.token.icon ? (
                      <img
                        src={vault.token.icon || "/placeholder.svg"}
                        alt={vault.token.symbol}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-xs">
                        {vault.token.symbol.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-white text-[15px] font-normal">
                    {vault.totalSupply.amount}
                  </span>
                </div>
                <div className="text-[13px] text-white px-[2px] bg-[#fafafa1a]">
                  {vault.totalSupply.usdValue}
                </div>
              </div>
            </InfoCard>

            {/* Instant APY */}
            <InfoCard title="Instant APY">
              <div className="text-[15px] text-white font-normal">
                {vault.instantApy}
              </div>
            </InfoCard>

            {/* Performance Fee */}
            <InfoCard
              title="Performance Fee"
              tooltip="The fee charged on earnings by the vault curator"
            >
              <div className="text-[15px] text-white font-normal">
                {vault.performanceFee}
              </div>
            </InfoCard>

            {/* Vault Address */}
            <InfoCard title="Vault Address">
              <div className="flex items-center gap-2">
                <span className="text-white text-[15px] font-normal">
                  {vault.vaultAddress}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-transparent hover:text-white cursor-pointer"
                  onClick={() =>
                    copyToClipboard(vault.vaultAddress, "Vault address")
                  }
                >
                  <Copy className="h-3 w-3 text-zinc-400" />
                </Button>
              </div>
            </InfoCard>

            {/* Liquidity */}
            <InfoCard
              title="Liquidity"
              tooltip="The amount of tokens available for borrowing"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                    {vault.token.icon ? (
                      <img
                        src={vault.token.icon || "/placeholder.svg"}
                        alt={vault.token.symbol}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-xs">
                        {vault.token.symbol.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-white text-[15px] font-normal">
                    {vault.liquidity.amount}
                  </span>
                </div>
                <div className="text-[13px] text-white px-[2px] bg-[#fafafa1a]">
                  {vault.liquidity.usdValue}
                </div>
              </div>
            </InfoCard>

            {/* Guardian Address */}
            <InfoCard
              title="Guardian Address"
              tooltip="The blockchain address of the vault guardian"
            >
              <div className="flex items-center gap-2">
                <span className="text-white text-[15px] font-normal">
                  {vault.guardianAddress}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-transparent hover:text-white cursor-pointer"
                  onClick={() =>
                    copyToClipboard(vault.guardianAddress, "Guardian address")
                  }
                >
                  <Copy className="h-3 w-3 text-zinc-400" />
                </Button>
              </div>
            </InfoCard>
          </div>
        </div>

        {/* Documents Section */}
        {/* <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Documents</h2>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#202426] border-zinc-700 hover:bg-zinc-800 text-white"
              onClick={() => setShowUploader(!showUploader)}
            >
              {showUploader ? "Cancel" : "Upload Document"}
            </Button>
          </div>

          {showUploader && (
            <div className="mb-6">
              <DocumentUploader
                vaultId={vault.id}
                onComplete={() => setShowUploader(false)}
              />
            </div>
          )}

          {vault.documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vault.documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <Card className="bg-[#202426] border-zinc-800 hover:bg-zinc-800 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-zinc-700 rounded-md p-2 mt-1">
                          <FileText className="h-5 w-5 text-zinc-300" />
                        </div>
                        <div>
                          <h3 className="font-medium group-hover:text-blue-400 transition-colors">
                            {doc.name}
                          </h3>
                          {doc.description && (
                            <p className="text-sm text-zinc-400 mt-1">
                              {doc.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-[#202426] rounded-lg p-6 border border-zinc-800 text-center">
              <p className="text-zinc-400">
                No documents available for this vault.
              </p>
            </div>
          )}
        </div> */}

        <div className="pt-16">
          <h1 className="text-[20px] text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div>Vault Allocation Breakdown</div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 hover:bg-transparent hover:text-white text-[#ffffff80]"
                    >
                      <HelpCircle className="h-3 w-3 text-[#fffff80]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      The table below shows a breakdown of the market exposures
                      of the vault. For example, the Supply APY represents the
                      amount of interest earned by the vault for supplying
                      liquidity to the market.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <CustomButton
                  variant="outline"
                  className="bg-[#303436] border-zinc-700 hover:bg-zinc-800 text-white text-[11px] rounded-[4px] h-[26px] flex items-center"
                >
                  Edit properties
                </CustomButton>
              </PopoverTrigger>
              <PopoverContent
                className="w-[300px] z-50 p-0 bg-[#303436] border-zinc-700 text-white"
                align="end"
                sideOffset={5}
              >
                <div className="p-0 border-b border-zinc-700">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search for properties"
                      className="pl-8 py-[10px] !shadow-none bg-[#303436] border-zinc-700 text-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {filteredColumns.map((column) => (
                    <div
                      key={column.id}
                      className="flex items-center justify-between py-2 px-3 h-[36px] hover:bg-[#fafafa20] rounded-sm"
                    >
                      <span className="text-[12px]">{column.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          toggleColumnVisibility(column.id, !column.visible)
                        }
                        className="hover:bg-transparent hover:text-white text-[#ffffffc2] h-8 w-8"
                      >
                        {visibleColumns.filter(
                          (_column) => column.id === _column.id
                        )[0].visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </h1>
          <VaultAllocationBreakdown
            allocations={vaultAllocations}
            visibleColumns={visibleColumns}
          />
        </div>
      </div>
    </Dashboard>
  );
}

interface InfoCardProps {
  title: string;
  tooltip?: string;
  children: React.ReactNode;
}

function InfoCard({ title, tooltip, children }: InfoCardProps) {
  return (
    <Card className="bg-[#202426] border-zinc-800 h-[100px] p-5 rounded-[8px]">
      <CardContent className="px-0 flex flex-col justify-between h-full">
        <div className="flex items-center gap-1 mb-3 text-[13px] text-zinc-400">
          <span>{title}</span>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                    <HelpCircle className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div>{children}</div>
      </CardContent>
    </Card>
  );
}
