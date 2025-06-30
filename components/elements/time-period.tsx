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
  showETHComparison,
}) => {
  const handleComparisonToggle = () => {
    if (!showComparison && !showETHComparison) {
      // Initial state (ETF only) - show BTC with ETF
      setShowComparison(true);
      setShowETHComparison(false);
    } else if (showComparison && !showETHComparison) {
      // BTC with ETF shown - switch to ETH with ETF
      setShowComparison(false);
      setShowETHComparison(true);
    } else if (!showComparison && showETHComparison) {
      // ETH with ETF shown - back to ETF only
      setShowETHComparison(false);
    }
  };

  const getButtonText = () => {
    if (showComparison && !showETHComparison) {
      return "Show ETH Comparison";
    } else if (!showComparison && showETHComparison) {
      return "Hide Comparison";
    } else {
      return "Show BTC Comparison";
    }
  };

  const getButtonColor = () => {
    if (showComparison && !showETHComparison) {
      return "bg-[#2470ff] hover:bg-blue-700 text-white"; // BTC blue
    } else if (!showComparison && showETHComparison) {
      return "bg-[#e95f6a] hover:bg-red-700 text-white"; // ETH red
    } else {
      return ""; // Default gray
    }
  };

  return (
    <div className="flex gap-2 justify-between flex-wrap">
      <div className="flex space-x-2 mb-4 flex-wrap">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => onPeriodChange(period.value)}
            className={`px-3 py-1 rounded-md text-sm ${
              selectedPeriod === period.value
                ? "bg-[#2470ff] text-white"
                : "bg-foreground text-secondary hover:text-primary"
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <CustomButton
          onClick={handleComparisonToggle}
          variant="secondary"
          className={`h-[26px] px-[8px] py-[5px] font-medium transition-colors text-primary ${getButtonColor()} text-[11px] rounded-[3px] cursor-pointer`}
        >
          {getButtonText()}
        </CustomButton>
      </div>
    </div>
  );
};
