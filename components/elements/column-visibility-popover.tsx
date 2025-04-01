"use client";

import { useState } from "react";
import { Eye, EyeOff, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CustomButton } from "../ui/custom-button";
import { useLanguage } from "@/contexts/language-context";

interface ColumnVisibilityPopoverProps {
  columns: { id: string; title: string; visible: boolean }[];
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
}

export function ColumnVisibilityPopover({
  columns,
  onColumnVisibilityChange,
}: ColumnVisibilityPopoverProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredColumns = columns.filter((column) =>
    column.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <CustomButton
          variant="secondary"
          className="text-[11px] py-[5px] px-[8px] rounded-[2px]"
        >
          {t("common.editProperties")}
        </CustomButton>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 bg-foreground text-card"
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
        <ScrollArea className="h-[300px]">
          <div className="p-1">
            {filteredColumns.map((column) => (
              <div
                key={column.id}
                className="flex items-center justify-between py-2 px-3 h-[36px] hover:bg-accent rounded-sm"
              >
                <span className="text-[12px]">
                  <span>
                    {column.id === "instantApy"
                      ? t("table.netAPY")
                      : column.id === "vaultApy"
                      ? t("table.supplyAPY")
                      : t("table." + column.id)}
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onColumnVisibilityChange(column.id, !column.visible)
                  }
                  className="hover:bg-transparent hover:text-primary text-card h-8 w-8"
                >
                  {column.visible ? (
                    <Eye className="h-4 w-4 text-card" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-card" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
