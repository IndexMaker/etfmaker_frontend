"use client";

import type React from "react";

import { ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Dashboard from "../Dashboard/dashboard";
import { CustomButton } from "@/components/ui/custom-button";
import Image from "next/image";
import TVL from "@/components/icons/tvl";
import Borrow from "@/components/icons/borrow";
import Deposit from "@/components/icons/deposit";
import Markets from "@/components/icons/market-created";
import FundMaker from "@/components/icons/fundmaker";
import APY from "@/components/icons/apy";
import { useLanguage } from "@/contexts/language-context";

export function AnalyticsPage() {
  const { t } = useLanguage();
  return (
    <Dashboard>
      <div className="">
        <div className="text-[38px] h-[44px] font-normal tracking-tight text-primary flex items-center">
          {t("common.analytics")}
        </div>

        {/* Total FundMaker Section */}
        <div className="space-y-4 pt-16">
          <div className="flex items-start gap-4 md:items-center flex-col md:flex-row justify-between">
            <h2 className="text-[16px] font-normal text-card">
              {t("common.totalFundMaker")}
            </h2>
            <div className="flex gap-2">
              <AnalyticsLink
                name="DefiLlama"
                icon="defillama"
                url="https://defillama.com/protocol/morpho"
              />
              <AnalyticsLink
                name="Dune"
                icon="dune"
                url="https://dune.com/morpho/"
              />
              <AnalyticsLink
                name="TokenTerminal"
                icon="token-terminal"
                url="https://tokenterminal.com/terminal/projects/morpho"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:gap-4 gap-3">
            <MetricCard
              title={t("common.totalDeposits")}
              value="$4.87B"
              icon={<Deposit className="h-3 w-3 text-blue-400" />}
            />
            <MetricCard
              title={t("common.totalBorrow")}
              value="$1.80B"
              icon={<Borrow className="h-3 w-3 text-blue-400" />}
            />
            <MetricCard
              title={t("common.tvl")}
              value="$3.06B"
              icon={<TVL className="h-3 w-3 text-blue-400" />}
            />
          </div>
        </div>

        {/* FundMaker - Mainnet Section */}
        <div className="space-y-4 pt-12">
          <div className="flex items-start gap-4 md:items-center flex-col md:flex-row justify-between">
            <h2 className="text-[16px] font-normal text-card">
              {t("common.fundmakerMainnet")}
            </h2>
            <div className="flex gap-2 flex-wrap">
              <AnalyticsLink
                name="BlockAnalytica"
                icon="fundmaker"
                url="https://morpho.blockanalitica.com/"
              />
              <AnalyticsLink
                name="DefiLlama - FundMaker"
                icon="defillama"
                url="https://defillama.com/protocol/morpho-blue"
              />
              <AnalyticsLink
                name="Dune - FundMaker"
                icon="dune"
                url="https://dune.com/morpho/morpho-blue-dashboard"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <SMMetricCard
              title={t("common.totalDeposits")}
              value="$4.01B"
              icon={<Deposit className="h-3 w-3 text-blue-400" />}
            />
            <SMMetricCard
              title={t("common.totalBorrow")}
              value="$1.51B"
              icon={<Borrow className="h-3 w-3 text-blue-400" />}
            />
            <SMMetricCard
              title={t("common.tvl")}
              value="$2.50B"
              icon={<TVL className="h-3 w-3 text-blue-400" />}
            />
            <SMMetricCard
              title={t("common.marketsCreated")}
              value="463"
              icon={<Markets className="h-3 w-3 text-blue-400" />}
            />
            <SMMetricCard
              title={t("common.fundmakerVaults")}
              value="153"
              icon={<FundMaker className="h-3 w-3 text-blue-400" />}
            />
          </div>
        </div>

        {/* FundMaker - Base Section */}
        <div className="space-y-4 pt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-normal text-primary">
              {t("common.fundmakerBase")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <SMMetricCard
              title={t("common.totalDeposits")}
              value="$794.46M"
              icon={<Deposit className="h-3 w-3 text-blue-400" />}
            />
            <SMMetricCard
              title={t("common.totalBorrow")}
              value="$270.75M"
              icon={<Borrow className="h-3 w-3 text-blue-400" />}
            />
            <SMMetricCard
              title={t("common.tvl")}
              value="$523.70M"
              icon={<TVL className="h-3 w-3 text-blue-400" />}
            />
            <SMMetricCard
              title={t("common.marketsCreated")}
              value="254"
              icon={<Markets className="h-3 w-3 text-blue-400" />}
            />
            <SMMetricCard
              title={t("common.fundmakerVaults")}
              value="145"
              icon={<FundMaker className="h-3 w-3 text-blue-400" />}
            />
          </div>
        </div>

        {/* FundMaker Optimizer Section */}
        <div className="space-y-4 pt-12">
          <div className="flex items-start gap-4 md:items-center flex-col md:flex-row justify-between">
            <h2 className="text-[16px] font-normal text-primary">
              {t("common.fundmakerOptimizer")}
            </h2>
            <div className="flex gap-2 flex-wrap">
              <AnalyticsLink
                name={"FundMaker Optimizers"}
                icon="fundmaker"
                url="https://optimizers.morpho.org/"
              />
              <AnalyticsLink
                name="DefiLlama - FundMaker Aave V3"
                icon="defillama"
                url="https://defillama.com/protocol/morpho-aavev3"
              />
              <AnalyticsLink
                name="DefiLlama - FundMaker Aave V2"
                icon="defillama"
                url="https://defillama.com/protocol/morpho-aave"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SMMetricCard
              title={t("common.totalDeposits")}
              value="$192.13M"
              icon={<Deposit className="h-3 w-3 text-blue-400" />}
            />
            <SMMetricCard
              title={t("common.totalBorrow")}
              value="$33.59M"
              icon={<Borrow className="h-3 w-3 text-blue-400" />}
            />
            <SMMetricCard
              title={t("common.tvl")}
              value="$158.54M"
              icon={<TVL className="h-3 w-3 text-blue-400" />}
            />
            <SMMetricCard
              title={t("common.averageAPYImprovement")}
              value="0.08%"
              icon={<APY className="h-3 w-3 text-blue-400" />}
            />
          </div>
        </div>
      </div>
    </Dashboard>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <Card className="bg-foreground border-none p-5 md:h-[160px] h-[110px]">
      <CardContent className="p-0 flex flex-col justify-between h-full gap-2">
        <div className="flex items-center gap-2 text-[12px] text-secondary">
          {icon}
          <span>{title}</span>
        </div>
        <div className="text-[38px] text-card h-[44px]">{value}</div>
      </CardContent>
    </Card>
  );
}

function SMMetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <Card className="bg-foreground border-none p-5 md:h-[100px] h-[90px]">
      <CardContent className="p-0 flex flex-col justify-between h-full gap-2">
        <div className="flex items-center gap-2 text-[12px] text-secondary">
          {icon}
          <span>{title}</span>
        </div>
        <div className="text-[20px] text-card">{value}</div>
      </CardContent>
    </Card>
  );
}

interface AnalyticsLinkProps {
  name: string;
  icon: string;
  url: string;
}

function AnalyticsLink({ name, icon, url }: AnalyticsLinkProps) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <CustomButton
        variant="outline"
        className="bg-accent border-none hover:bg-muted text-[11px] text-primary rounded-[2px] flex items-center gap-1"
      >
        <Image
          src={`https://cdn.morpho.org/assets/logos/${icon}.svg`}
          width={15}
          height={15}
          alt="FundMaker"
        />
        <div>{name}</div>
        <ArrowUpRight className="ml-1 h-3 w-3" />
      </CustomButton>
    </a>
  );
}
