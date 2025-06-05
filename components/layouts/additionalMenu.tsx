"use client";

import { useLanguage } from "@/contexts/language-context";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Home } from "lucide-react";
import { useState } from "react";
import { SubscribeModal } from "../subscribe/subscribe-modal";
import { useDispatch } from "react-redux";
import { addSelectedVault } from "@/redux/vaultSlice";

interface AdditionalMenuProps {
  className: string;
  canBuy?: boolean;
  indexName?: string;
  ticker?: string;
}

export function AdditionalMenu({
  className,
  canBuy = false,
  indexName,
  ticker
}: AdditionalMenuProps) {
  const { t } = useLanguage();
  const [isCalendlyOpen, setIsCalendlyOpen] = useState(false);
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false);
  const dispatch = useDispatch();

  // Function to handle supply button click
  const handleSupplyClick = (name: string, ticker: string) => {
    dispatch(addSelectedVault({ name, ticker }));
  };
  return (
    <>
      <footer
        className={cn(
          "flex w-full flex-row gap-4 justify-start bottom-0 h-[40px] md:h-[40px] pt-0 shrink-0 items-center bg-background px-[4px]",
          className
        )}
      >
        <Link
          className={cn(
            "flex items-center gap-3 rounded-sm py-[6px] font-[500] transition-colors ",
            "justify-center px-0",
            "bg-transparent hover:underline text-primary text-[16px] cursor-pointer"
          )}
          href={"/"}
        >
          <Home className="text-primary hover:underline text-[16px] w-5 h-5" />
        </Link>
        <span className="text-primary text-[16px]">/</span>
        <button
          className={cn(
            "flex items-center gap-3 rounded-sm py-[6px] font-[500] transition-colors ",
            "justify-center px-0",
            "bg-transparent hover:underline text-primary text-[16px] cursor-pointer"
          )}
          onClick={() => setIsCalendlyOpen(true)}
        >
          {t("common.connect")}
        </button>
        <span className="text-primary text-[16px]">/</span>
        <button
          className={cn(
            "flex items-center gap-3 rounded-sm py-[6px] font-[500] transition-colors ",
            "justify-center px-0",
            "bg-transparent hover:underline text-primary text-[16px] cursor-pointer"
          )}
          onClick={() => setIsSubscribeOpen(true)}
        >
          {t("common.subscribe")}
        </button>
        <>
          <span className="text-primary text-[16px]">/</span>
          <button
            className={cn(
              "flex items-center gap-3 rounded-sm py-[6px] font-[500] transition-colors",
              "justify-center px-0",
              canBuy
                ? "bg-transparent hover:underline text-primary text-[16px] cursor-pointer"
                : "bg-transparent text-gray-400 text-[16px] cursor-not-allowed"
            )}
            onClick={
              canBuy
                ? () =>
                    indexName && ticker ? handleSupplyClick(indexName, ticker) : {}
                : undefined
            }
            disabled={!canBuy}
          >
            {t("common.buy")}
          </button>
        </>
      </footer>



      {/* Subscribe Modal */}
      <SubscribeModal
        isOpen={isSubscribeOpen}
        onClose={() => setIsSubscribeOpen(false)}
        IndexName={indexName || ""}
      />
    </>
  );
}
