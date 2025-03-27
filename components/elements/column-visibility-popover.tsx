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

interface ColumnVisibilityPopoverProps {
  columns: { id: string; title: string; visible: boolean }[];
  onColumnVisibilityChange: (columnId: string, visible: boolean) => void;
}

export function ColumnVisibilityPopover({
  columns,
  onColumnVisibilityChange,
}: ColumnVisibilityPopoverProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredColumns = columns.filter((column) =>
    column.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <CustomButton
          variant="secondary"
          className="text-xs py-[5px] px-[8px] rounded-[2px]"
        >
          Edit properties
        </CustomButton>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 bg-[#202426] border-zinc-700 text-white"
        align="start"
        sideOffset={5}
      >
        <div className="p-0 border-b border-zinc-700">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for properties"
              className="pl-8 py-[10px] !shadow-none bg-[#202426] border-zinc-700 text-white"
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
                className="flex items-center justify-between py-2 px-3 h-[36px] hover:bg-[#afafaf1a] rounded-sm"
              >
                <span className="text-[12px]">{column.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    onColumnVisibilityChange(column.id, !column.visible)
                  }
                  className="hover:bg-transparent hover:text-white text-[#ffffffc2] h-8 w-8"
                >
                  {column.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
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
