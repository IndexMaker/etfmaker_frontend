"use client";

import { Button } from "@/components/ui/button";
import FundMaker from "@/components/icons/fundmaker";
import { CustomButton } from "@/components/ui/custom-button";
import { useCallback } from "react";
import { IndexListEntry } from "@/types";
import CustomTooltip from "@/components/elements/custom-tooltip";
import Image from "next/image";
import { Copy } from "lucide-react";

interface IndexBalanceProps {
  className?: string;
  index: IndexListEntry;
  indexBalance?: string;
  tokenSymbol?: string;
  instantAPY?: string;
  onSupplyClick?: (indexId: string, token: string) => void;
}

export default function IndexBalance({
  className = "",
  index,
  indexBalance = '-',
  tokenSymbol = "USDC",
  instantAPY = "24.79",
  onSupplyClick,
}: IndexBalanceProps) {
  const onClickBuyButton = useCallback(() => {
    onSupplyClick && onSupplyClick(index.name, index.ticker);
  }, []);
  return (
    <div className={`w-full bg-foreground rounded-lg shadow ${className}`}>
      <div className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b ">
              <tr className="p-4">
                <th className="text-left py-3 px-4 font-medium text-secondary text-[13px]">
                  Token
                </th>
                <th className="text-left py-3 px-4 font-medium text-secondary text-[13px]">
                  Client Balance
                </th>
                <th className="text-left py-3 px-4 font-medium text-secondary text-[13px]">
                  Index Balance
                </th>
                <th className="text-right py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              <tr className="p-4">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-transparent rounded-full flex items-center justify-center">
                      <FundMaker className="w-5 h-5 text-muted" />
                    </div>
                    <span className="font-medium text-secondary text-[13px]">
                      {index.name}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 font-medium text-secondary text-[13px]">
                  {index.performance?.oneYearReturn.toFixed(2)} %
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-2 items-start">
                    <span className="font-medium text-secondary">{indexBalance}</span>
                    {/* <div className="flex items-left gap-0 min-w-[150px]">
                       {index.collateral.length > 0 ? (
                        <>
                          {index.collateral
                            .slice(0, 5)
                            .map((collateral, _index) => (
                              <CustomTooltip
                                key={_index.toString()}
                                content={
                                  <div className="flex flex-col gap-1 min-w-[220px] rounded-[8px] bg-background">
                                    <div className="flex justify-between border-b py-1 px-3 border-accent">
                                      <span>Collateral</span>
                                      <div className="flex items-center">
                                        <Image
                                          src={collateral.logo}
                                          alt={"Collateral"}
                                          width={17}
                                          height={17}
                                        />
                                        <span> {collateral.name}</span>
                                      </div>
                                    </div>
                                    <div className="flex justify-between border-b py-1 px-3 border-accent">
                                      <span className="">Binance</span>
                                      <Copy className="w-[15px] h-[15px]" />
                                    </div>
                                  </div>
                                }
                              >
                                <span className="hover:px-1 hover:transition-all">
                                  <div className="flex items-center gap-1">
                                    {collateral.logo !== "" && (
                                      <Image
                                        src={collateral.logo}
                                        alt={"Collateral"}
                                        width={17}
                                        height={17}
                                        className="mr-1" // Adds slight overlap between images
                                      />
                                    )}
                                  </div>
                                </span>
                              </CustomTooltip>
                            ))}
                          {index.collateral.length > 5 && (
                            <CustomTooltip
                              content={
                                <div className="flex flex-col gap-2 p-2 bg-background max-h-[400px] overflow-y-auto">
                                  {index.collateral
                                    .slice(5)
                                    .map((collateral, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center gap-2"
                                      >
                                        <span>{collateral.name}</span>
                                      </div>
                                    ))}
                                </div>
                              }
                            >
                              <span className="text-[12px] pl-2 text-primary">
                                + {index.collateral.length - 5} Assets
                              </span>
                            </CustomTooltip>
                          )}
                        </>
                      ) : null} 
                      
                    </div> */}
                  </div>
                </td>
                <td className="py-4 px-4 text-right max-w-[140px] w-[140px]">
                  <CustomButton
                    className="min-w-[100px] text-white"
                    onClick={() => onClickBuyButton()}
                  >
                    Buy
                  </CustomButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
