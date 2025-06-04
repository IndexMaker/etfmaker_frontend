"use client";

import { useLanguage } from "@/contexts/language-context";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Home } from "lucide-react";
interface FooterProps {
  className: string;
}
export function Footer({ className }: FooterProps) {
  const { t } = useLanguage();
  return (
    <footer
      className={cn(
        "flex w-full flex-row gap-4 justify-end bottom-0 h-[40px] md:h-[40px] pt-0 shrink-0 items-center bg-background px-[11px] lg:px-[40px] border-b border-gray-400",
        className
      )}
    >
      <Link
        className={cn(
          "flex items-center gap-3 rounded-sm py-[6px] font-[500] transition-colors ",
          "justify-center px-0",
          "bg-transparent hover:underline text-primary text-[12px]"
          // className,
          // active
          //   ? "bg-foreground hover:bg-accent text-primary"
          //   : " hover:bg-accent hover:text-muted"
        )}
        href={"/"}
      >
        <Home className="text-primary hover:underline text-[12px] w-4 h-4" />
      </Link>
      <span className="text-primary text-[12px]">/</span>
      <Link
        className={cn(
          "flex items-center gap-3 rounded-sm py-[6px] font-[500] transition-colors ",
          "justify-center px-0",
          "bg-transparent hover:underline text-primary text-[12px]"
          // className,
          // active
          //   ? "bg-foreground hover:bg-accent text-primary"
          //   : " hover:bg-accent hover:text-muted"
        )}
        href={"/connect"}
      >
        {t("common.connect")}
      </Link>
      <span className="text-primary text-[12px]">/</span>
      <Link
        className={cn(
          "flex items-center gap-3 rounded-sm py-[6px] font-[500] transition-colors ",
          "justify-center px-0",
          "bg-transparent hover:underline text-primary text-[12px]"
          // className,
          // active
          //   ? "bg-foreground hover:bg-accent text-primary"
          //   : " hover:bg-accent hover:text-muted"
        )}
        href={"/subscribe"}
      >
        {t("common.subscribe")}
      </Link>
      <span className="text-primary text-[12px]">/</span>
      <Link
        className={cn(
          "flex items-center gap-3 rounded-sm py-[6px] font-[500] transition-colors ",
          "justify-center px-0",
          "bg-transparent hover:underline text-primary text-[12px]"
          // className,
          // active
          //   ? "bg-foreground hover:bg-accent text-primary"
          //   : " hover:bg-accent hover:text-muted"
        )}
        href={"/buy"}
      >
        {t("common.buy")}
      </Link>
    </footer>
  );
}
