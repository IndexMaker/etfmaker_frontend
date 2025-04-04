"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { X, BarChart2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NavigationAlert from "../icons/navigation-alert";
import { Vault } from "@/lib/types/vault";
import Image from "next/image";
import CustomTooltip from "./custom-tooltip";
import InstantAPY from "../icons/instantApy";
import { useLanguage } from "@/contexts/language-context";

interface SupplyPanelProps {
  vaultId: string;
  vault: Vault;
  onClose: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function SupplyPanel({
  vaultId,
  vault,
  onClose,
  open,
  setOpen,
}: SupplyPanelProps) {
  const [amount, ] = useState("");
  const { t } = useLanguage();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setOpen(false);
      } else {
        // setOpen(false)
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setOpen]);
  // const handleMaxClick = () => {
  //   // In a real app, this would set the max available balance
  //   setAmount("1000.00");
  // };

  // const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   // Only allow numbers and decimals
  //   const value = e.target.value;
  //   if (/^[0-9]*\.?[0-9]*$/.test(value)) {
  //     setAmount(value);
  //   }
  // };

  const handleSupply = () => {
    // In a real app, this would handle the supply transaction
    console.log(`Supplying ${amount} to vault ${vaultId}`);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <div
        className={cn(
          "border-l border-accent bg-foreground overflow-hidden lg:relative fixed lg:border-none top-0 bottom-0 right-0 w-[300px] lg:w-[400px]",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full lg:h-[calc(100%-50px)]">
          <div className="flex flex-row items-center justify-between pt-[32px] pb-[16px] px-[18px] border-b border-accent">
            <span className="text-[20px] text-primary">
              {t("common.bundler")}
            </span>
            <div onClick={() => setOpen(!open)}>
              <NavigationAlert className="h-4 w-4 text-primary flex lg:hidden cursor-pointer" />
            </div>
          </div>
          {/* Header */}
          <div className="flex items-start justify-between py-8 px-4 ">
            <div className="flex items-start gap-2">
              <div className="w-[20px] h-[20px] rounded-full flex items-start justify-center text-ellipsis overflow-hidden">
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
              <div className="flex flex-col gap-1">
                <h2 className="font-normal text-[15px] text-secondary">
                  {vault.name}
                </h2>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <span className="text-[11px] bg-accent px-2 py-0.5 rounded">
                    {vault.curator.name}
                  </span>
                  <span className="text-[11px] bg-accent px-2 py-0.5 rounded">
                    {vault.token.symbol}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-secondary cursor-pointer hover:text-primary bg-accent p-[6px] w-[24px] h-[24px]  rounded-[4px]"
            >
              <X className="h-2 w-2" style={{ width: "12px" }} />
            </Button>
          </div>

          {/* Supply form */}
          <div className="p-4 pt-0 border-b border-accent">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] text-secondary">
                  {t("table.supply")} {vault.token.symbol}
                </label>
              </div>
              <div className="flex flex-col">
                <div className="flex flex-row items-center justify-between gap-1 space-x-2 px-[8px] py-[10px] bg-accent rounded-[8px] border-accent border-[0.5px]">
                  {/* Input and Value Display */}
                  <div className="flex flex-col">
                    <input
                      type="text"
                      placeholder="0"
                      inputMode="decimal"
                      autoComplete="off"
                      autoCorrect="off"
                      step="any"
                      className="w-full font-mono text-[14px] outline-none bg-transparent text-primary placeholder-gray-400"
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(
                          /[^0-9.]/g,
                          ""
                        ); // Allow only numbers and decimal point
                      }}
                      onKeyDown={(e) => {
                        if (
                          !/[0-9.]/.test(e.key) && // Allow numbers and decimal point
                          e.key !== "Backspace" &&
                          e.key !== "Delete" &&
                          e.key !== "ArrowLeft" &&
                          e.key !== "ArrowRight"
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <div className="font-mono text-[11px] text-muted">
                      $0.00
                    </div>
                  </div>

                  <div className="flex flex-row gap-1 items-center">
                    {/* Asset Logo */}
                    <span className="flex items-center w-[20px] h-[20px]">
                      <Image
                        src="https://cdn.morpho.org/assets/logos/usdc.svg"
                        alt="USDC"
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    </span>

                    {/* Asset Name */}
                    <span className="text-secondary text-[12px]">USDC</span>

                    {/* Max Button */}
                    <Button
                      type="button"
                      className="px-[8px] py-[5px] h-[26px] text-[12px] rounded-[4px] bg-accent text-primary hover:bg-muted"
                    >
                      {t("common.max")}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-1">
                <span className="text-xs text-secondary">
                  {t("common.balance")}: 0 {vault.token.symbol}
                </span>
              </div>
            </div>

            {/* APY info */}
            <div className="space-y-4 mb-6 pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-[12px] text-muted">
                    {t("common.oneDayEarnAPY")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-normal text-primary text-[12px]">
                    {vault.instantApy}
                  </span>
                  {Number.parseFloat(vault.instantApy) > 5 && (
                    <CustomTooltip
                      key={"instantApy"}
                      content={
                        <div className="flex flex-col gap-1 min-w-[220px] bg-accent rounded-[8px]">
                          <div className="flex justify-between border-b py-1 px-3 border-accent">
                            <span className="text-sm">Rate & Rewards</span>
                          </div>
                          <div className="flex justify-between border-b py-1 px-3 border-accent">
                            <div className="flex items-center gap-1">
                              <BarChart2 className="h-4 w-4" />
                              <span>Rate</span>
                            </div>
                            <span>+5.25%</span>
                          </div>
                          <div className="flex justify-between border-b py-1 px-3 border-accent">
                            <div className="flex items-center gap-1">
                              <Image
                                src={`https://cdn.morpho.org/assets/logos/usdc.svg`}
                                alt={vault.token.symbol}
                                width={14}
                                height={14}
                              />
                              <span className="text-xs">Morpho</span>
                              <Copy className="w-[15px] h-[15px] cursor-pointer" />
                            </div>
                            <span className="font-bold">+1.16%</span>
                          </div>
                          <div className="flex justify-between border-b py-1 px-3 border-accent">
                            <div className="flex items-center">
                              <InstantAPY className="w-[17px] h-[17px]" />
                              <span className="text-[#2470FFe6]">Morpho</span>
                            </div>
                            <span className="font-bold text-[#2470FFe6]">
                              = 6.41%
                            </span>
                          </div>
                        </div>
                      }
                    >
                      <span className="text-[11px] text-blue-400">
                        <InstantAPY className="w-[15px] h-[15px] hover:transition-all cursor-pointer" />
                      </span>
                    </CustomTooltip>
                  )}
                </div>
              </div>

              {/* Collateral Exposure */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1">
                  <span className="text-[12px] text-muted">
                    {t("common.collateralExposure")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {vault.collateral.length > 0 ? (
                    vault.collateral.map((collateral, index) => (
                      <CustomTooltip
                        key={index.toString()}
                        content={
                          <div className="flex flex-col gap-1 min-w-[220px] bg-accent rounded-[8px]">
                            <div className="flex justify-between border-b py-1 px-3 border-accent">
                              <span>Collateral</span>
                              <div className="flex items-center">
                                <Image
                                  src={`https://cdn.morpho.org/assets/logos/usdc.svg`}
                                  alt={vault.token.symbol}
                                  width={17}
                                  height={17}
                                />
                                <span>PT-U...025</span>
                              </div>
                            </div>
                            <div className="flex justify-between border-b py-1 px-3 border-accent">
                              <span>LLTV</span>
                              <span className="font-bold">91.5%</span>
                            </div>
                            <div className="flex justify-between border-b py-1 px-3 border-accent">
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
                        <span className="hover:px-1 hover:transition-all text-primary text-[12px] cursor-pointer">
                          {collateral}
                        </span>
                      </CustomTooltip>
                    ))
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="mt-auto px-4 py-6 border-t border-accent">
            <div className="flex gap-10 lg:gap-30 items-center h-[40px] justify-between">
              <Button
                variant="outline"
                className="h-[26px] px-[8px] py-[5px] border-accent w-[50px] bg-accent text-[11px] hover:bg-foreground text-primary cursor-pointer"
                onClick={onClose}
              >
                {t("common.cancel")}
              </Button>
              <Button
                className="flex-1 h-[40px] bg-blue-600 hover:bg-blue-700 text-primary text-[14px] cursor-pointer"
                disabled={!amount || Number.parseFloat(amount) <= 0}
                onClick={handleSupply}
              >
                {t("common.finalizeTransactions")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
