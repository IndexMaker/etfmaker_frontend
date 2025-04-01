"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { transactionTypes } from "@/lib/data";
import { useLanguage } from "@/contexts/language-context";

export function TransactionTypeSelector() {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState(transactionTypes[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="px-0">
        <Button
          variant="outline"
          className="flex justify-between pl-[8px] rounded-[4px] cursor-pointer text-[11px] w-[142px] line-[16px] items-center bg-foreground has-[>svg]:px-2 m-auto max-h-[26px] border-none text-secondary hover:text-primary hover:bg-accent gap-1 hover:border-none shadow-none"
        >
          {t("type." + selectedType.id)}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[200px] bg-foreground border-none text-[11px] text-primary"
      >
        {transactionTypes.map((type) => (
          <DropdownMenuItem
            key={type.id}
            onClick={() => setSelectedType(type)}
            className="flex items-center justify-between active:bg-background"
          >
            <span className="flex items-center gap-2">
              <span className="text-[13px]">{t("type." + type.id)}</span>
            </span>
            {selectedType.id === type.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
