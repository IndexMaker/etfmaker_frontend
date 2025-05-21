// components/TimePeriodSelector.tsx
"use client";

import React from "react";
import { Button } from "../ui/button";
import { CustomButton } from "../ui/custom-button";

const periods = [
  { label: "YTD", value: "ytd" },
  { label: "6M", value: "6m" },
  { label: "1Y", value: "1y" },
  { label: "3Y", value: "3y" },
  { label: "5Y", value: "5y" },
  { label: "10Y", value: "10y" },
  { label: "All", value: "all" },
];

interface TimePeriodSelectorProps {
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  setShowComparison: (showComparison: boolean) => void;
  showComparison: boolean;
  setShowETHComparison: (showETHComparison: boolean) => void;
  showETHComparison: boolean;
}

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  showComparison,
  setShowComparison,
  setShowETHComparison,
  showETHComparison
}) => {
  return (
    <div className="flex gap-2 justify-between flex-wrap">
      <div className="flex space-x-2 mb-4 flex-wrap">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => onPeriodChange(period.value)}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedPeriod === period.value
                ? "bg-blue-500 text-primary"
                : "bg-foreground text-secondary hover:text-secondary"
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <CustomButton
          onClick={() => setShowComparison(!showComparison)}
          className="h-[26px] px-[8px] py-[5px] font-medium transition-colors text-white bg-[#2470ff] hover:bg-blue-700 text-[11px] rounded-[3px] cursor-pointer"
        >
          {showComparison ? "Hide BTC Comparison" : "Show BTC Comparison"}
        </CustomButton>
        <CustomButton
          onClick={() => setShowETHComparison(!showETHComparison)}
          className="h-[26px] px-[8px] py-[5px] font-medium transition-colors text-white bg-[#e95f6a] hover:bg-red-700 text-[11px] rounded-[3px] cursor-pointer"
        >
          {showETHComparison ? "Hide ETH Comparison" : "Show ETH Comparison"}
        </CustomButton>
      </div>
    </div>
  );
};
