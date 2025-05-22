"use client";

import type React from "react";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle,
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
import { useEffect, useState } from "react";
import Dashboard from "../Dashboard/dashboard";
import { toast } from "sonner";
import {
  VaultAsset,
  mockup_vaults,
  supplyPositions,
  userActivities,
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
import { cn, getERC20AddressForIndex, shortenAddress } from "@/lib/utils";
import { PerformanceChart } from "@/components/elements/performance-chart";
import { TimePeriodSelector } from "@/components/elements/time-period";
import { IndexListEntry } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchBtcHistoricalData,
  fetchEthHistoricalData,
  fetchHistoricalData,
  fetchVaultAssets,
} from "@/api/indices";
import FundMaker from "@/components/icons/fundmaker";
import { VaultAssets } from "@/components/elements/vault-assets";
interface VaultDetailPageProps {
  index: IndexListEntry | null;
}
interface ChartDataPoint {
  name: string;
  date: string;
  value: number;
  price?: number;
}
const USDC_ADDRESS_IN_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
export interface IndexData {
  name: string;
  indexId: number;
  rawData: any[];
  chartData: ChartDataPoint[];
  formattedTransactions: any[];
}
export function VaultDetailPage({ index }: VaultDetailPageProps) {
  const { t } = useLanguage();
  const vault = mockup_vaults[0];
  const isMobile = useMediaQuery({ maxWidth: 1540 });
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [indexData, setIndexData] = useState<IndexData | null>(null);
  const [btcData, setBtcData] = useState<any[]>([]);
  const [ethData, setEthData] = useState<any[]>([]);
  const [selectedIndexId, setSelectedIndexId] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showETHComparison, setShowETHComparison] = useState(false);
  const [indexAssets, setIndexAssets] = useState<VaultAsset[]>([])
  useEffect(() => {
    const fetchData = async (indexId: number) => {
      setIsLoading(true);
      try {
        const response = await fetchHistoricalData(indexId);
        const data = response;
        data && setIndexData(data);
      } catch (error) {
        console.error("Error fetching performance data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    index?.indexId && fetchData(index.indexId);

    const _fetchBtcHistoricalData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchBtcHistoricalData();
        const data = response;
        setBtcData(data);
      } catch (error) {
        console.error("Error fetching btc data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    index?.indexId && _fetchBtcHistoricalData();

    const _fetchEthHistoricalData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchEthHistoricalData();
        const data = response;
        setEthData(data);
      } catch (error) {
        console.error("Error fetching eth data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    index?.indexId && _fetchEthHistoricalData();

    const _fetchVaultAssets = async (_indexId: number) => {
      setIsLoading(true);
      try {
        const response = await fetchVaultAssets(_indexId);
        const data = response;
        setIndexAssets(data);
      } catch (error) {
        console.error("Error fetching eth data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    index?.indexId && _fetchVaultAssets(index?.indexId);
  }, [index]);

  const getCutoffDate = () => {
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
    return cutoffDate;
  };

  const filteredChartData = () => {
    return indexData && indexData.chartData
      ? indexData.chartData.filter(
          (item) => new Date(item.date) >= getCutoffDate()
        )
      : [];
  };

  const filteredBtcData = () => {
    return btcData
      ? btcData.filter((item) => new Date(item.date) >= getCutoffDate())
      : [];
  };

  const filteredEthData = () => {
    return ethData
      ? ethData.filter((item) => new Date(item.date) >= getCutoffDate())
      : [];
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
    // { id: "id", name: "Id", visible: true },
    { id: "ticker", name: "Ticker", visible: true },
    { id: "assetname", name: "Asset Name", visible: true },
    { id: "sector", name: "Sector", visible: true },
    { id: "market_cap", name: "Market Cap", visible: true },
    { id: "weights", name: "Weight", visible: true },
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
      {index ? (
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
                  <div className="text-4xl">
                    {vault.token.symbol.charAt(0) || ""}
                  </div>
                )}
              </div>
              <div className="flex gap-6 flex-col">
                <h1 className="text-[38px] min-w-[50%] h-[44px] text-primary text-center xl:text-left">
                  {index.ticker}
                </h1>
                <div className="flex items-center gap-4 mt-2 justify-center xl:justify-start">
                  <div className="flex items-center gap-2">
                    <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-transparent flex items-center justify-center">
                      <Image
                        src={`https://cdn.morpho.org/assets/logos/usdc.svg`}
                        alt={vault.token.symbol}
                        width={17}
                        height={17}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <span className="text-secondary text-[20px]">{"USDC"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-transparent flex items-center justify-center">
                      <FundMaker className="w-[17px] h-[17px]" />
                    </div>
                    <span className="text-secondary text-[20px]">
                      {"SYMMIO"}
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
                    <CuratorInfo curator={index.curator} />
                  </div>
                </InfoMobileCard>

                <InfoMobileCard title={t("table.token")}>
                  <TokenInfo token={vault.token} />
                </InfoMobileCard>

                <InfoMobileCard title={t("table.totalSupply")}>
                  <TokenValue token={vault.token} value={index.totalSupply} />
                </InfoMobileCard>

                <InfoMobileCard title={t("table.ytdReturn")}>
                  <div className="text-sm text-secondary">
                    {index.ytdReturn}
                  </div>
                </InfoMobileCard>

                <InfoMobileCard title={t("table.managementFee")}>
                  <div className="text-sm text-secondary">
                    {index.managementFee || ""}%
                  </div>
                </InfoMobileCard>

                <InfoMobileCard title={t("table.vaultAddress")}>
                  <AddressInfo
                    address={getERC20AddressForIndex(index.indexId) || ""}
                  />
                </InfoMobileCard>

                <InfoMobileCard title={t("table.liquidity")}>
                  <TokenValue token={vault.token} value={index.totalSupply} />
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
                      <FundMaker className="h-5 w-5" />
                    </div>
                    <span className="text-secondary text-[15px] font-normal">
                      {"SYMMIO"}
                    </span>
                    {
                      <Link
                        href={`https://basescan.org/address/${index.curator}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ArrowUpRight className="h-4 w-4 text-secondary" />
                      </Link>
                    }
                  </div>
                </InfoCard>

                {/* Token */}
                <InfoCard title={t("table.token")}>
                  <div className="flex items-center gap-2">
                    <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
                      <Image
                        src={"https://cdn.morpho.org/assets/logos/usdc.svg"}
                        alt={"USDC"}
                        className="object-cover w-full h-full"
                        width={17}
                        height={17}
                      />
                    </div>
                    <span className="text-secondary text-[15px] font-normal">
                      {"USDC"}
                    </span>
                    {USDC_ADDRESS_IN_BASE && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 hover:bg-transparent hover:text-primary cursor-pointer"
                        onClick={() =>
                          copyToClipboard(
                            USDC_ADDRESS_IN_BASE || "",
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
                        <Image
                          src={"https://cdn.morpho.org/assets/logos/usdc.svg"}
                          alt={"USDC"}
                          className="object-cover w-full h-full"
                          width={17}
                          height={17}
                        />
                      </div>
                      <span className="text-secondary text-[15px] font-normal">
                        {index.totalSupply} USDC
                      </span>
                    </div>
                    <div className="text-[13px] text-secondary px-[2px] bg-accent">
                      {index.totalSupply}
                    </div>
                  </div>
                </InfoCard>

                {/* Instant APY */}
                <InfoCard title={t("table.ytdReturn")}>
                  <div className="text-[15px] text-secondary font-normal">
                    {index.ytdReturn}
                  </div>
                </InfoCard>

                {/* Performance Fee */}
                <InfoCard
                  title={t("table.managementFee")}
                  tooltip="The fee charged on earnings by the vault curator"
                >
                  <div className="text-[15px] text-secondary font-normal">
                    {index.managementFee} %
                  </div>
                </InfoCard>

                {/* Vault Address */}
                <InfoCard title={t("table.vaultAddress")}>
                  <div className="flex items-center gap-2">
                    <span className="text-secondary text-[15px] font-normal">
                      {shortenAddress(getERC20AddressForIndex(index.indexId))}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 hover:bg-transparent hover:text-primary cursor-pointer"
                      onClick={() =>
                        copyToClipboard(
                          getERC20AddressForIndex(index.indexId),
                          "Index address"
                        )
                      }
                    >
                      <Copy className="h-3 w-3 text-secondary" />
                    </Button>
                  </div>
                </InfoCard>

                {/* liquidity */}
                <InfoCard
                  title={t("table.liquidity")}
                  tooltip="The amount of tokens available for borrowing"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="relative h-[17px] w-[17px] rounded-full overflow-hidden bg-foreground flex items-center justify-center">
                        <Image
                          src={"https://cdn.morpho.org/assets/logos/usdc.svg"}
                          alt={"USDC"}
                          className="object-cover w-full h-full"
                          width={17}
                          height={17}
                        />
                      </div>
                      <span className="text-secondary text-[15px] font-normal">
                        {index.totalSupply} USDC
                      </span>
                    </div>
                    <div className="text-[13px] text-secondary px-[2px] bg-[#fafafa1a]">
                      {index.totalSupply}
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
                        copyToClipboard(
                          vault.guardianAddress,
                          "Guardian address"
                        )
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

            <TimePeriodSelector
              selectedPeriod={selectedPeriod}
              onPeriodChange={setSelectedPeriod}
              showComparison={showComparison}
              showETHComparison={showETHComparison}
              setShowComparison={setShowComparison}
              setShowETHComparison={setShowETHComparison}
            />

            {indexData && (
              <div className="bg-background p-4 rounded-lg shadow">
                <PerformanceChart
                  data={filteredChartData()}
                  indexId={index.indexId}
                  btcData={filteredBtcData()}
                  ticker={index.ticker || ""}
                  ethData={filteredEthData()}
                  showComparison={showComparison}
                  showETHComparison={showETHComparison}
                />
              </div>
            )}
          </div>

          {/* Vault Literature */}
          <div className="pt-20">
            <h2 className="lg:text-[20px] text-[16px] mb-4 text-primary font-custom">
              {t("common.vaultInfo")}
            </h2>
            <VaultLiteratureSection
              literature={vault.documents}
              rebalanceData={indexData?.rawData ? indexData?.rawData : []}
              indexId={index.indexId}
              indexName={index.name}
            />
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

          {/* <div className="pt-16">
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
          </div> */}

          <div className="pt-16">
            <h1 className="lg:text-[20px] text-primary flex justify-between lg:items-center flex-row flex-wrap lg:flex-nowrap">
              <div className="flex items-center gap-3">
                <div>{t("common.vaultAssets")}</div>
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
            <VaultAssets
              assets={indexAssets}
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
              reallocations={indexData?.formattedTransactions || []}
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

          {/* TOS */}
          <div className="pt-16">
            <div className="grid grid-cols-1">
              <div className="col-span-1">
                <h4 className="text-[13px] pb-2 pt-3 font-bold text-primary">
                  Note on the Fund management company and the fund
                </h4>
                <p className="text-[13px] mb-0 pb-4 text-secondary">
                  Multi Units Luxembourg, RCS B115129 and Lyxor Index Fund, RCS
                  B117500, both Luxembourg SICAV located 9, rue de Bitbourg,
                  L-1273 Luxembourg, and managed by Amundi Asset Management.
                  Lyxor SICAV, Luxembourg SICAV, RCS B140772, located 5, Allée
                  Scheffer, L-2520 Luxembourg, managed by Amundi Luxembourg
                  S.A..
                </p>
                <p className="text-[13px] mb-0 pb-4 text-secondary">
                  The Fund is described in a Key Information Document (KID), or
                  Key Investor Information Document (KIID) for UK investors, and
                  prospectus. The Funds KID, or KIID for UK investors, must be
                  made available to potential subscribers prior to subscription.
                </p>
                <p className="text-[13px] mb-0 pb-4 text-secondary">
                  The Funds reference material (KIID, prospectus, annual and
                  semi-annual reports) can be obtained from Amundi on request,
                  or obtained via the amundietf.com website. <br></br>
                  For Professional Clients only. In the United Kingdom (the
                  "UK"), this website is being issued by Amundi (UK) Limited, 77
                  Coleman Street, London EC2R 5BJ, UK. Amundi (UK) Limited is
                  authorised and regulated by the Financial Conduct Authority
                  ("FCA") and entered on the FCA's Financial Services Register
                  under number 114503. This may be checked at
                  https://register.fca.org.uk/ and further information of its
                  authorisation is available on request. Each fund and its
                  relevant sub-fund(s) under its respective fund range that is
                  referred to in this website (each, a "Fund") is a recognised
                  collective investment scheme for the purposes of Section 264
                  of the Financial Services and Markets Act 2000 (the "FSMA") or
                  an unregulated collective investment scheme under the
                  Financial Services and Markets Act 2000 (the "FSMA"). This
                  website is addressed only to those persons in the UK falling
                  within one or more of the following exemptions from the
                  restrictions in Section 238 FSMA:<br></br>- Authorised firms
                  under FSMA and certain other investment professionals falling
                  within article 14 of the FSMA (Promotion of Collective
                  Investment Schemes) (Exemptions) Order 2001, as amended (the
                  "CIS Order") and their directors, officers and employees
                  acting for such entities in relation to investment.<br></br>-
                  High value entities falling within article 22 CIS Order and
                  their directors, officers and employees acting for such
                  entities in relation to investment;<br></br>- Other persons
                  who are in accordance with the Rules of the FCA prior to 1
                  November 2007 classified as Intermediate Customers or Market
                  Counterparties or on or thereafter classified as Professional
                  Clients or Eligible Counterparties.<br></br>
                  The distribution of this website's information to any person
                  in the UK not falling within one of the above categories is
                  not permitted by Amundi (UK) Limited and may contravene FSMA.
                  No person in the UK falling outside those categories should
                  rely or act on it for any purposes whatsoever. <br></br>
                  This website's information is only directed at persons who are
                  Professional Clients (as defined in the FCA's Handbook of
                  Rules and Guidance), must not be distributed to the public and
                  must not be relied or acted upon by any other persons for any
                  purposes whatsoever. <br></br>
                  Potential investors in the UK should be aware that none of the
                  protections afforded by the UK regulatory system will apply to
                  an investment in a Fund and that compensation will not be
                  available under the UK Financial Services Compensation Scheme.{" "}
                  <br></br>
                </p>
                <p className="text-[13px] mb-0 pb-4 text-secondary">
                  Regarding Funds admitted on a regulated market, the listing is
                  subject to a volatility control mechanisms to ensure that the
                  ETF price does not deviate significantly from a reference
                  price set by the listing rules of the relevant regulated
                  market, notably through the implementation of a trading halt
                  mechanism in case of significant deviation from this reference
                  price.
                </p>
                <p className="text-[13px] mb-0 pb-4 text-secondary">
                  The Fund offers no capital guarantee. Investors may not get
                  back the full amount of their initial investment, particularly
                  in the event that the benchmark index falls. Subscribing to a
                  UCITS may involve risks. Potential investors are advised to
                  read the Funds risk profile, which is described in detail in
                  the prospectus. The amount that is reasonable to invest in the
                  Fund will depend on the personal circumstances of each
                  investor. To determine this amount, investors should take into
                  account their financial situation, personal assets, and
                  current and future requirements, as well as considering their
                  willingness to accept risks or conversely their preference to
                  invest cautiously. Investors are also strongly recommended to
                  sufficiently diversify their investments so as to avoid being
                  exposed solely to the risks of this Fund. Investors should
                  therefore seek advice in this regard from their usual advisors
                  (legal, tax, financial and/or accounting) before purchasing
                  any units of the Fund.
                </p>
                <p className="text-[13px] mb-0 pb-4 text-secondary">
                  The source of the data contained in this document is Amundi
                  Asset Management unless otherwise stated.
                </p>
                <p className="text-[13px] mb-0 pb-4 font-bold text-secondary">
                  Policy regarding portfolio transparency and warning on
                  secondary market
                </p>
                <p className="text-[13px] mb-0 pb-4 text-secondary">
                  The policy regarding portfolio transparency and information on
                  the funds assets are available on amundietf.com. Indicative
                  net asset value is published by stock exchanges. Shares
                  purchased on the secondary market cannot usually be sold
                  directly back to the fund. Investors must buy and sell shares
                  on a secondary market with the assistance of an intermediary
                  (e.g. a stockbroker) and may incur fees for doing so.
                  Investors may pay more than the current net asset value when
                  buying shares and may receive less than the current net asset
                  value when selling them.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="xl:pl-[86px] xl:pr-[86px] lg:mt-9 2xl:-mx-[40px]">
          <div
            className={cn("flex gap-16", isMobile ? "flex-col" : "flex-row")}
          >
            {/* Left Column - Vault Info */}
            <div
              className={cn(
                "flex flex-col xl:flex-row items-center gap-8 flex-nowrap mt-9 lg:mt-0 w-full",
                isMobile ? "w-full" : "w-[50%]"
              )}
            >
              {/* Avatar Skeleton */}
              <Skeleton className="h-[100px] w-[100px] rounded-full" />

              {/* Text Info Skeleton */}
              <div className="flex gap-6 flex-col w-full">
                {/* Title Skeleton */}
                <Skeleton className="h-[44px] w-[200px] rounded-sm" />

                {/* Token & Curator Info Skeleton */}
                <div className="flex items-center gap-4 mt-2 justify-center xl:justify-start">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-[17px] w-[17px] rounded-full" />
                    <Skeleton className="h-[20px] w-[60px] rounded-sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-[17px] w-[17px] rounded-full" />
                    <Skeleton className="h-[20px] w-[80px] rounded-sm" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Description Skeleton */}
            <div className="bg-foreground rounded-sm p-5 flex items-center w-full">
              <div className="space-y-2 w-full">
                <Skeleton className="h-[16px] w-full rounded-sm" />
                <Skeleton className="h-[16px] w-4/5 rounded-sm" />
                <Skeleton className="h-[16px] w-3/4 rounded-sm" />
              </div>
            </div>
          </div>
          <Skeleton className="h-[300px] mt-[10]"></Skeleton>
        </div>
      )}
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

const CuratorInfo = ({ curator }: { curator: string }) => (
  <div className="flex items-center gap-2">
    <div className="relative h-5 w-5 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
      <FundMaker className="h-5 w-5" />
    </div>
    <span className="text-secondary text-[13px] font-normal">{"SYMMIO"}</span>
    {
      <Link href={`https://basescan.org/address/${curator}`}>
        <ArrowUpRight className="h-4 w-4 text-zinc-400" />
      </Link>
    }
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
          src={"https://cdn.morpho.org/assets/logos/usdc.svg"}
          alt={"USDC"}
          className="w-full h-full"
          width={20}
          height={20}
        />
      ) : (
        <div className="text-[11px]">{"USDC"}</div>
      )}
    </div>
    <span className="text-secondary text-[13px] font-normal">{"USDC"}</span>
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
  value: number;
}) => (
  <div className="flex flex-row items-center lg:items-center gap-1 lg:gap-2">
    <div className="flex items-center gap-2">
      <div className="relative h-5 w-5 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
        {token.icon ? (
          <Image
            src={"https://cdn.morpho.org/assets/logos/usdc.svg"}
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
        {value} USDC
      </span>
    </div>
    <div className="text-[11px] text-secondary px-1 bg-accent">{value}</div>
  </div>
);

const AddressInfo = ({ address }: { address: string }) => (
  <div className="flex items-center gap-2">
    <a
      href={`https://basescan.org/address/${address}`}
      target="_blank"
      className="text-secondary text-[13px] font-normal"
    >
      {shortenAddress(address)}
    </a>
  </div>
);
