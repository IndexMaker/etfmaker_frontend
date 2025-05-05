"use client";

import type React from "react";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  CheckCircle,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
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
import { useEffect, useState } from "react";
import Dashboard from "../Dashboard/dashboard";
import { toast } from "sonner";
import { VaultAllocationBreakdown } from "@/components/elements/vault-allocation-breakdown";
import {
  reallocations,
  supplyPositions,
  userActivities,
  vaultAllocations,
} from "@/lib/data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Input } from "@/components/ui/input";
import { CustomButton } from "@/components/ui/custom-button";
import { VaultReAllocation } from "@/components/elements/vault-reallocation";
import { VaultSupply } from "@/components/elements/vault-supplyposition";
import { TransactionTypeSelector } from "@/components/elements/transaction-types";
import { VaultActivity } from "@/components/elements/vault-activity";
import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";
import { VaultLiteratureSection } from "./vault-literature";
import { cn } from "@/lib/utils";
import { PerformanceChart } from "@/components/elements/performance-chart";
import { TimePeriodSelector } from "@/components/elements/time-period";
import axios from "axios";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
interface VaultDetailPageProps {
  vault: Vault;
}
interface IndexData {
  name: string;
  indexId: number;
  rawData: any[];
  chartData: {
    name: string;
    date: string;
    value: number;
    price?: number;
  }[];
}
export function VaultDetailPage({ vault }: VaultDetailPageProps) {
  const { t } = useLanguage();
  const isMobile = useMediaQuery({ maxWidth: 1540 });

  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [indexData, setIndexData] = useState<IndexData[]>([]);
  const [selectedIndexId, setSelectedIndexId] = useState<number | null>(null);

  useEffect(() => {
    const API_BASE_URL = process.env.BACKEND_API || "https://miserable-georgie-hotcoding85-6ad5b67a.koyeb.app"
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios(
          `${API_BASE_URL}/indices/getHistoricalData`
        );
        const data = response.data;
        setIndexData(data);
        if (data.length > 0) {
          setSelectedIndexId(data[0].indexId);
        }
      } catch (error) {
        console.error("Error fetching performance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = (indexId: number) => {
    const index = indexData.find((item) => item.indexId === indexId);
    if (!index) return [];

    const now = new Date();
    let cutoffDate = new Date(0); // All time

    switch (selectedPeriod) {
      case "ytd":
        cutoffDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "6m":
        cutoffDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case "1y":
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case "3y":
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 3));
        break;
      case "5y":
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 5));
        break;
      case "10y":
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 10));
        break;
    }

    return index.chartData.filter((item) => new Date(item.date) >= cutoffDate);
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast(type + " copied to clipboard.", {
      position: "top-right",
      icon: <CheckCircle />,
    });
  };

  // Default visible columns
  const [visibleColumns, setVisibleColumns] = useState([
    { id: "percentage", name: "Allocation %", visible: true },
    { id: "vaultSupply", name: "Vault Supply", visible: true },
    { id: "collateral", name: "Collateral", visible: true },
    { id: "netAPY", name: "Net APY", visible: true },
    { id: "oracle", name: "Oracle", visible: true },
    { id: "supplyCap", name: "Supply Cap", visible: false },
    { id: "capPercentage", name: "Cap %", visible: false },
    { id: "supplyAPY", name: "Supply APY", visible: false },
    { id: "rewards", name: "Rewards", visible: false },
    { id: "totalCollateral", name: "Total Collateral", visible: false },
    { id: "utilization", name: "Utilization", visible: false },
    { id: "rateAtUTarget", name: "Rate at uTarget", visible: false },
    { id: "marketId", name: "Market ID", visible: false },
  ]);

  const [visibleReAllocationColumns, setVisibleReAllocationColumns] = useState([
    { id: "timestamp", name: "Date & Time", visible: true },
    { id: "market", name: "Market", visible: true },
  ]);

  const [visibleTransactionColumns, setVisibleTransactionColumns] = useState([
    { id: "dateTime", name: "Date & Time", visible: true },
    { id: "wallet", name: "Wallet", visible: true },
    { id: "hash", name: "Hash", visible: true },
    { id: "transactionType", name: "Tramsaction Types", visible: true },
    { id: "amount", name: "Amount", visible: true },
  ]);

  const [searchQuery, setSearchQuery] = useState("");

  const toggleColumnVisibility = (columnId: string, visible: boolean) => {
    setVisibleColumns(
      visibleColumns.map((column) =>
        column.id === columnId ? { ...column, visible } : column
      )
    );
  };

  const toggleReAllocationColumnVisibility = (
    columnId: string,
    visible: boolean
  ) => {
    setVisibleReAllocationColumns(
      visibleReAllocationColumns.map((column) =>
        column.id === columnId ? { ...column, visible } : column
      )
    );
  };

  const toggleActivityColumnVisibility = (
    columnId: string,
    visible: boolean
  ) => {
    setVisibleTransactionColumns(
      visibleTransactionColumns.map((column) =>
        column.id === columnId ? { ...column, visible } : column
      )
    );
  };

  const filteredColumns = visibleColumns.filter((column) =>
    column.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredReallocationColumns = visibleReAllocationColumns.filter(
    (column) => column.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredActivityColumns = visibleTransactionColumns.filter((column) =>
    column.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dashboard>
      <div className="xl:pl-[86px] xl:pr-[86px] lg:mt-9 2xl:-mx-[40px]">
        {/* Vault Header */}
        <div
          className={cn("flex gap-16 ", isMobile ? "flex-col" : "flex-row ")}
        >
          <div
            className={cn(
              "flex flex-col xl:flex-row items-center gap-8 flex-nowrap mt-9 lg:mt-0 w-full overflow-ellipsis",
              isMobile ? "w-full" : "w-[50%]"
            )}
          >
            <div
              className={cn(
                "h-[100px] min-w-[100px] rounded-full overflow-hidden bg-transparent p-[6.6px] flex items-center justify-center",
                isMobile ? "" : ""
              )}
            >
              {vault.icon ? (
                <Image
                  src={vault.icon || "/placeholder.svg"}
                  alt={vault.name}
                  className="object-cover w-full h-full rounded-full"
                  width={87}
                  height={87}
                />
              ) : (
                <div className="text-4xl">{vault.token.symbol.charAt(0)}</div>
              )}
            </div>
            <div className="flex gap-6 flex-col">
              <h1 className="text-[38px] min-w-[50%] h-[44px] text-primary text-center xl:text-left">
                {vault.name}
              </h1>
              <div className="flex items-center gap-4 mt-2 justify-center xl:justify-start">
                <div className="flex items-center gap-2">
                  <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-transparent flex items-center justify-center">
                    {vault.token.icon ? (
                      <Image
                        src={
                          vault.token.icon ||
                          `https://cdn.morpho.org/assets/logos/${vault.token.symbol}.svg`
                        }
                        alt={vault.token.symbol}
                        width={17}
                        height={17}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-xs text-primary">
                        {vault.token.symbol.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-secondary text-[20px]">
                    {vault.token.symbol}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-transparent flex items-center justify-center">
                    {vault.curator.icon ? (
                      <Image
                        src={
                          vault.curator.icon ||
                          `https://cdn.morpho.org/assets/logos/mevcapital.png`
                        }
                        width={17}
                        height={17}
                        alt={vault.curator.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="text-xs">
                        {vault.curator.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-secondary text-[20px]">
                    {vault.curator.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Vault Description */}
          <div className="bg-foreground rounded-sm p-5  flex items-center">
            <p className="text-secondary text-[13px] leading-[16px]">
              {vault.description}
            </p>
          </div>
        </div>

        {/* Vault Info */}
        <div className="pt-20">
          <h2 className="lg:text-[20px] text-[16px] mb-4 text-primary font-custom">
            {t("common.vaultInfo")}
          </h2>
          {isMobile ? (
            <div className="grid grid-cols-1 md:gird md:grid-cols-2 rounded-[8px] bg-foreground px-[10px] md:px-5 md:[&>:nth-child(2n+1)]:pr-10 md:[&>:nth-child(2n)]:pl-10">
              <InfoMobileCard title={t("table.curator")}>
                <div className="flex items-center flex-row">
                  <CuratorInfo curator={vault.curator} />
                </div>
              </InfoMobileCard>

              <InfoMobileCard title={t("table.token")}>
                <TokenInfo token={vault.token} />
              </InfoMobileCard>

              <InfoMobileCard title={t("table.totalSupply")}>
                <TokenValue token={vault.token} value={vault.totalSupply} />
              </InfoMobileCard>

              <InfoMobileCard title={t("table.instantAPY")}>
                <div className="text-sm text-secondary">{vault.instantApy}</div>
              </InfoMobileCard>

              <InfoMobileCard title={t("table.performanceFee")}>
                <div className="text-sm text-secondary">
                  {vault.performanceFee}
                </div>
              </InfoMobileCard>

              <InfoMobileCard title={t("table.vaultAddress")}>
                <AddressInfo address={vault.vaultAddress || ""} />
              </InfoMobileCard>

              <InfoMobileCard title={t("table.liquidity")}>
                <TokenValue token={vault.token} value={vault.liquidity} />
              </InfoMobileCard>

              <InfoMobileCard title={t("table.guardianAddress")}>
                <AddressInfo address={vault.guardianAddress || ""} />
              </InfoMobileCard>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5">
              {/* Curator */}
              <InfoCard title={t("table.curator")}>
                <div className="flex items-center gap-2">
                  <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                    {vault.curator.icon ? (
                      <Image
                        src={vault.curator.icon || "/placeholder.svg"}
                        alt={vault.curator.name}
                        className="object-cover w-full h-full"
                        width={17}
                        height={17}
                      />
                    ) : (
                      <div className="text-xs">
                        {vault.curator.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-secondary text-[15px] font-normal">
                    {vault.curator.name}
                  </span>
                  {vault.curator.url && (
                    <Link
                      href={vault.curator.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ArrowUpRight className="h-4 w-4 text-secondary" />
                    </Link>
                  )}
                </div>
              </InfoCard>

              {/* Token */}
              <InfoCard title={t("table.token")}>
                <div className="flex items-center gap-2">
                  <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                    {vault.token.icon ? (
                      <Image
                        src={vault.token.icon || "/placeholder.svg"}
                        alt={vault.token.symbol}
                        className="object-cover w-full h-full"
                        width={17}
                        height={17}
                      />
                    ) : (
                      <div className="text-xs">
                        {vault.token.symbol.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-secondary text-[15px] font-normal">
                    {vault.token.symbol}
                  </span>
                  {vault.token.address && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-transparent hover:text-primary cursor-pointer"
                      onClick={() =>
                        copyToClipboard(
                          vault.token.address || "",
                          "Token address"
                        )
                      }
                    >
                      <Copy className="h-3 w-3 text-secondary hover:text-primary" />
                    </Button>
                  )}
                </div>
              </InfoCard>

              {/* Total Supply */}
              <InfoCard title={t("table.totalSupply")}>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                      {vault.token.icon ? (
                        <Image
                          src={vault.token.icon || "/placeholder.svg"}
                          alt={vault.token.symbol}
                          className="object-cover w-full h-full"
                          width={17}
                          height={17}
                        />
                      ) : (
                        <div className="text-xs">
                          {vault.token.symbol.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-secondary text-[15px] font-normal">
                      {vault.totalSupply.amount}
                    </span>
                  </div>
                  <div className="text-[13px] text-secondary px-[2px] bg-accent">
                    {vault.totalSupply.usdValue}
                  </div>
                </div>
              </InfoCard>

              {/* Instant APY */}
              <InfoCard title={t("table.instantAPY")}>
                <div className="text-[15px] text-secondary font-normal">
                  {vault.instantApy}
                </div>
              </InfoCard>

              {/* Performance Fee */}
              <InfoCard
                title={t("table.performanceFee")}
                tooltip="The fee charged on earnings by the vault curator"
              >
                <div className="text-[15px] text-secondary font-normal">
                  {vault.performanceFee}
                </div>
              </InfoCard>

              {/* Vault Address */}
              <InfoCard title={t("table.vaultAddress")}>
                <div className="flex items-center gap-2">
                  <span className="text-secondary text-[15px] font-normal">
                    {vault.vaultAddress}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-transparent hover:text-primary cursor-pointer"
                    onClick={() =>
                      copyToClipboard(vault.vaultAddress, "Vault address")
                    }
                  >
                    <Copy className="h-3 w-3 text-secondary" />
                  </Button>
                </div>
              </InfoCard>

              {/* liquidity */}
              <InfoCard
                title={t("table.instantAPY")}
                tooltip="The amount of tokens available for borrowing"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-foreground flex items-center justify-center">
                      {vault.token.icon ? (
                        <Image
                          src={vault.token.icon || "/placeholder.svg"}
                          alt={vault.token.symbol}
                          className="object-cover w-full h-full"
                          width={17}
                          height={17}
                        />
                      ) : (
                        <div className="text-xs">
                          {vault.token.symbol.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-secondary text-[15px] font-normal">
                      {vault.liquidity.amount}
                    </span>
                  </div>
                  <div className="text-[13px] text-secondary px-[2px] bg-[#fafafa1a]">
                    {vault.liquidity.usdValue}
                  </div>
                </div>
              </InfoCard>

              {/* Guardian Address */}
              <InfoCard
                title={t("table.guardianAddress")}
                tooltip="The blockchain address of the vault guardian"
              >
                <div className="flex items-center gap-2">
                  <span className="text-secondary text-[15px] font-normal">
                    {vault.guardianAddress}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-transparent hover:text-primary cursor-pointer"
                    onClick={() =>
                      copyToClipboard(vault.guardianAddress, "Guardian address")
                    }
                  >
                    <Copy className="h-3 w-3 text-secondary" />
                  </Button>
                </div>
              </InfoCard>
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="pt-20">
          <h2 className="lg:text-[20px] text-[16px] mb-4 text-primary font-custom">
            Index Performance
          </h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-secondary mb-2">
              Choose Index
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-left rounded-md border border-secondary text-primary bg-background hover:bg-muted"
                >
                  {indexData.find((i) => i.indexId === selectedIndexId)?.name || "Select Index"}
                  <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[400px] xs-[200px] bg-foreground border-none text-sm text-secondary">
                {indexData.map((index) => (
                  <DropdownMenuItem
                    key={index.indexId}
                    onClick={() => setSelectedIndexId(index.indexId)}
                    className="flex items-center justify-between active:bg-[#fafafa20] p-4"
                  >
                    <span>{index.name}</span>
                    {selectedIndexId === index.indexId && <Check className="h-4 w-4" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <TimePeriodSelector
            selectedPeriod={selectedPeriod}
            onPeriodChange={setSelectedPeriod}
          />

          {selectedIndexId && (
            <div className="bg-background p-4 rounded-lg shadow">
              <PerformanceChart
                data={filteredData(selectedIndexId)}
                indexId={selectedIndexId}
              />
            </div>
          )}
        </div>

        {/* Vault Literature */}
        <div className="pt-20">
          <h2 className="lg:text-[20px] text-[16px] mb-4 text-primary font-custom">
            {t("common.vaultInfo")}
          </h2>
          <VaultLiteratureSection literature={vault.documents} />
        </div>

        {/* Documents Section */}
        {/* <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Documents</h2>
            <Button
              variant="outline"
              size="sm"
              className="bg-foreground border-zinc-700 hover:bg-zinc-800 text-primary"
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
            <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-cols-3 gap-4">
              {vault.documents.map((doc) => (
                <Link
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block group"
                >
                  <Card className="bg-foreground border-zinc-800 hover:bg-zinc-800 transition-colors">
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
            <div className="bg-foreground rounded-lg p-6 border border-zinc-800 text-center">
              <p className="text-zinc-400">
                No documents available for this vault.
              </p>
            </div>
          )}
        </div> */}

        <div className="pt-16">
          <h1 className="lg:text-[20px] text-primary flex justify-between lg:items-center flex-row flex-wrap lg:flex-nowrap">
            <div className="flex items-center gap-3">
              <div>{t("common.vaultAllocationBreakdown")}</div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 p-0 hover:bg-transparent hover:text-primary text-[#ffffff80]"
                    >
                      <HelpCircle className="h-3 w-3 text-[#fffff80]" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      {t("common.vaultAllocationBreakdownNote")}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <CustomButton
                  variant="secondary"
                  onClick={() => setSearchQuery("")}
                  className="border-none text-[11px] rounded-[4px] h-[26px] flex items-center"
                >
                  {t("common.editProperties")}
                </CustomButton>
              </PopoverTrigger>
              <PopoverContent
                className="w-[300px] z-50 p-0 bg-foreground text-card border-zinc-700"
                align="end"
                sideOffset={5}
              >
                <div className="p-0 border-b border-zinc-700">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={t("common.searchProperties")}
                      className="pl-8 py-[10px] !shadow-none bg-foreground border-zinc-700 text-card"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {filteredColumns.map((column) => (
                    <div
                      key={column.id}
                      className="flex items-center justify-between py-2 px-3 h-[36px] hover:bg-accent rounded-sm"
                    >
                      <span className="text-[12px]">
                        {t("table." + column.id)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          toggleColumnVisibility(column.id, !column.visible)
                        }
                        className="hover:bg-transparent hover:text-primary text-card h-8 w-8"
                      >
                        {visibleColumns.filter(
                          (_column) => column.id === _column.id
                        )[0].visible ? (
                          <Eye className="h-4 w-4 text-card" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-card" />
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

        <div className="pt-16">
          <h1 className="lg:text-[20px] text-primary flex justify-between lg:items-center flex-row flex-wrap lg:flex-nowrap">
            <div className="flex items-center gap-3">
              <div>{t("common.vaultReallocations")}</div>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <CustomButton
                  variant="secondary"
                  onClick={() => setSearchQuery("")}
                  className="border-none text-[11px] rounded-[4px] h-[26px] flex items-center"
                >
                  {t("common.editProperties")}
                </CustomButton>
              </PopoverTrigger>
              <PopoverContent
                className="w-[300px] z-50 p-0 bg-foreground text-card border-zinc-700"
                align="end"
                sideOffset={5}
              >
                <div className="p-0 border-b border-zinc-700">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder={t("common.searchProperties")}
                      className="pl-8 py-[10px] !shadow-none bg-foreground border-zinc-700 text-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {filteredReallocationColumns.map((column) => (
                    <div
                      key={column.id}
                      className="flex items-center justify-between py-2 px-3 h-[36px] hover:bg-accent rounded-sm"
                    >
                      <span className="text-[12px]">
                        {t("table." + column.id)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          toggleReAllocationColumnVisibility(
                            column.id,
                            !column.visible
                          )
                        }
                        className="hover:bg-transparent hover:text-primary text-card h-8 w-8"
                      >
                        {visibleReAllocationColumns.filter(
                          (_column) => column.id === _column.id
                        )[0].visible ? (
                          <Eye className="h-4 w-4 text-card" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-card" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </h1>
          <VaultReAllocation
            reallocations={reallocations}
            visibleColumns={visibleReAllocationColumns}
          />
        </div>

        <div className="pt-16">
          <h1 className="lg:text-[20px] text-primary flex justify-between lg:items-center flex-row flex-wrap lg:flex-nowrap">
            <div className="flex items-center gap-3">
              <div>{t("common.supplyPositions")}</div>
            </div>
          </h1>
          <VaultSupply supplyPositions={supplyPositions} />
        </div>

        <div className="pt-16">
          <h1 className="lg:text-[20px] text-primary flex justify-between lg:items-center flex-row flex-wrap lg:flex-nowrap">
            <div className="flex items-center gap-3">
              <div>{t("common.userActivity")}</div>
            </div>
            <div className="flex items-center gap-4">
              <TransactionTypeSelector />
              <Popover>
                <PopoverTrigger asChild>
                  <CustomButton
                    variant="secondary"
                    onClick={() => setSearchQuery("")}
                    className="border-none text-[11px] rounded-[4px] h-[26px] flex items-center"
                  >
                    {t("common.editProperties")}
                  </CustomButton>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[300px] z-50 p-0 bg-foreground border-zinc-700 text-primary"
                  align="end"
                  sideOffset={5}
                >
                  <div className="p-0 border-b border-zinc-700">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder={t("common.searchProperties")}
                        className="pl-8 py-[10px] !shadow-none bg-foreground border-zinc-700 text-primary"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredActivityColumns.map((column) => (
                      <div
                        key={column.id}
                        className="flex items-center justify-between py-2 px-3 h-[36px] hover:bg-accent rounded-sm"
                      >
                        <span className="text-[12px]">
                          {t("table." + column.id)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            toggleActivityColumnVisibility(
                              column.id,
                              !column.visible
                            )
                          }
                          className="hover:bg-transparent hover:text-primary text-card h-8 w-8"
                        >
                          {visibleTransactionColumns.filter(
                            (_column) => column.id === _column.id
                          )[0].visible ? (
                            <Eye className="h-4 w-4 text-card" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-card" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </h1>
          <VaultActivity
            activities={userActivities}
            visibleColumns={visibleTransactionColumns}
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
    <Card className="bg-foreground border-[#afafaf1a] border-none h-[100px] p-5 rounded-[8px] shadow-none">
      <CardContent className="px-0 flex flex-col justify-between h-full border-none">
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

function InfoMobileCard({ title, tooltip, children }: InfoCardProps) {
  return (
    <Card className="bg-foreground border-accent border-b-[0.5px] border-t-0 border-l-[0px] border-r-[0px] rounded-none h-[60px] pt-[6px] pb-[6px] pl-0 shadow-none">
      <CardContent className="px-0 flex flex-row justify-between h-full items-center border-none">
        <div className="flex items-center gap-1 text-[13px] text-muted">
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

const CuratorInfo = ({
  curator,
}: {
  curator: {
    name: string;
    icon: string;
    url?: string;
  };
}) => (
  <div className="flex items-center gap-2">
    <div className="relative h-5 w-5 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
      {curator.icon ? (
        <Image
          src={curator.icon}
          alt={curator.name}
          className="w-full h-full"
          width={20}
          height={20}
        />
      ) : (
        <div className="text-[11px]">{curator.name.charAt(0)}</div>
      )}
    </div>
    <span className="text-secondary text-[13px] font-normal">
      {curator.name}
    </span>
    {curator.url && (
      <Link href={curator.url} target="_blank">
        <ArrowUpRight className="h-4 w-4 text-zinc-400" />
      </Link>
    )}
  </div>
);

const TokenInfo = ({
  token,
}: {
  token: {
    symbol: string;
    icon: string;
    address?: string;
  };
}) => (
  <div className="flex items-center gap-2">
    <div className="relative h-5 w-5 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
      {token.icon ? (
        <Image
          src={token.icon}
          alt={token.symbol}
          className="w-full h-full"
          width={20}
          height={20}
        />
      ) : (
        <div className="text-[11px]">{token.symbol.charAt(0)}</div>
      )}
    </div>
    <span className="text-secondary text-[13px] font-normal">
      {token.symbol}
    </span>
  </div>
);

const TokenValue = ({
  token,
  value,
}: {
  token: {
    symbol: string;
    icon: string;
    address?: string;
  };
  value: {
    amount: string;
    usdValue: string;
  };
}) => (
  <div className="flex flex-row items-center lg:items-center gap-1 lg:gap-2">
    <div className="flex items-center gap-2">
      <div className="relative h-5 w-5 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
        {token.icon ? (
          <Image
            src={token.icon}
            alt={token.symbol}
            className="w-full h-full"
            width={20}
            height={20}
          />
        ) : (
          <div className="text-[11px]">{token.symbol.charAt(0)}</div>
        )}
      </div>
      <span className="text-secondary text-[13px] font-normal">
        {value.amount}
      </span>
    </div>
    <div className="text-[11px] text-secondary px-1 bg-accent">
      {value.usdValue}
    </div>
  </div>
);

const AddressInfo = ({ address }: { address: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-secondary text-[13px] font-normal">{address}</span>
  </div>
);
