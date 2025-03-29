"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { SupplyPosition } from "@/lib/data";
import RightArrow from "../icons/right-arrow";
import Image from "next/image";

interface VaultSupplyProps {
  supplyPositions: SupplyPosition[];
}
const allColumns = [
  { id: "user", name: "User", visible: true },
  { id: "supply", name: "Supply", visible: true },
  { id: "share", name: "Share", visible: true },
];
export function VaultSupply({ supplyPositions }: VaultSupplyProps) {
  // Helper function to render cell content based on column ID
  const renderCellContent = (supply: SupplyPosition, columnId: string) => {
    switch (columnId) {
      case "user":
        return (
          <div className="flex items-center gap-2">
            <Image
              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4IDgiIHNoYXBlLXJlbmRlcmluZz0ib3B0aW1pemVTcGVlZCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ij48cGF0aCBmaWxsPSJoc2woMTM2IDk4JSAzOSUpIiBkPSJNMCwwSDhWOEgweiIvPjxwYXRoIGZpbGw9ImhzbCgzNTEgNzklIDM4JSkiIGQ9Ik0xLDBoMXYxaC0xek02LDBoMXYxaC0xek0yLDBoMXYxaC0xek01LDBoMXYxaC0xek0zLDBoMXYxaC0xek00LDBoMXYxaC0xek0xLDJoMXYxaC0xek02LDJoMXYxaC0xek0xLDNoMXYxaC0xek02LDNoMXYxaC0xek0yLDNoMXYxaC0xek01LDNoMXYxaC0xek0zLDNoMXYxaC0xek00LDNoMXYxaC0xek0xLDRoMXYxaC0xek02LDRoMXYxaC0xek0zLDRoMXYxaC0xek00LDRoMXYxaC0xek0xLDVoMXYxaC0xek02LDVoMXYxaC0xek0yLDVoMXYxaC0xek01LDVoMXYxaC0xek0zLDZoMXYxaC0xek00LDZoMXYxaC0xek0xLDdoMXYxaC0xek02LDdoMXYxaC0xeiIvPjxwYXRoIGZpbGw9ImhzbCgyNDMgNTAlIDcyJSkiIGQ9Ik0yLDFoMXYxaC0xek01LDFoMXYxaC0xek0wLDJoMXYxaC0xek03LDJoMXYxaC0xek0yLDJoMXYxaC0xek01LDJoMXYxaC0xek0zLDVoMXYxaC0xek00LDVoMXYxaC0xek0xLDZoMXYxaC0xek02LDZoMXYxaC0xeiIvPjwvc3ZnPg=="
              className="w-[17px] h-[17px] rounded-full"
              width={17}
              height={17}
              alt="user"
            />
            <div>{supply.user}</div>
            <div>
              <RightArrow
                className="rotate-135 text-[#FFFFFF99]"
                width="13px"
                height="13px"
              />
            </div>
          </div>
        );
      case "supply":
        return (
          <div className="flex items-center gap-2">
            <div>
              {supply.supply} {supply.currency}
            </div>
            <div className="pl-[2px] pt-1 rounded-[4px] bg-[#fafafa1a] text-white text-[11px] flex items-center">
              {supply.supplySummary}
            </div>
          </div>
        );
      case "share":
        return (
          <div className="flex items-center gap-2">
            <div>{supply.share}%</div>
          </div>
        );
      default:
        return "—";
    }
  };

  return (
    <>
      <Card className="bg-[#202426] border-none rounded-[8px] mt-4 py-0 rouneded-[8px]">
        <CardContent className="p-0 overflow-x-auto rouneded-[8px]">
          <Table className="rouneded-[16px]">
            <TableHeader className="bg-[#202426]">
              <TableRow className="hover:bg-transparent border-[#afafaf1a] h-[44px]">
                {allColumns.map((column) => (
                  <TableHead
                    key={column.id}
                    className={cn(
                      "text-[#ffffffcc] text-[13px] pl-[20px] pr-[72px]"
                    )}
                  >
                    {column.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplyPositions.map((allocation) => (
                <TableRow
                  key={allocation.id}
                  className="border-[#afafaf1a] hover:bg-[#202426]/50 h-[54px] text-[13px]"
                >
                  {allColumns.map((column, index) => (
                    <TableCell
                      className="pl-[20px] text-[#fffffff2] pr-18"
                      key={`${allocation.id}-${index}`}
                    >
                      {renderCellContent(allocation, column.id)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
