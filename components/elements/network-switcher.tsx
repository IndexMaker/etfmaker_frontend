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
import Image from "next/image";
import Base from "../../public/icons/base.png";
const networks = [
  {
    id: "ethereum",
    name: "Ethereum",
    icon: (
      <Image
        src={"https://cdn.morpho.org/assets/chains/eth.svg"}
        alt={"Ethereum"}
        width={17}
        height={17}
      />
    ),
  },
  {
    id: "base",
    name: "Base",
    icon: <Image src={Base} alt={"Base"} width={17} height={17} />,
  },
];

export function NetworkSwitcher() {
  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="px-0">
        <Button
          variant="outline"
          className="flex rounded-[3px] cursor-pointer text-xs line-[16px] items-center gap-2 bg-[#fafafa1a] px-[5px] py-[3px] max-h-[26px] border-none text-white hover:text-white hover:bg-[#fafafa1a] hover:border-none shadow-none"
        >
          <span className="flex items-center gap-2">
            <span>{selectedNetwork.icon}</span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[200px] bg-[#fafafa1a] border-none text-sm text-white"
      >
        {networks.map((network) => (
          <DropdownMenuItem
            key={network.id}
            onClick={() => setSelectedNetwork(network)}
            className="flex items-center justify-between active:bg-[#fafafa20]"
          >
            <span className="flex items-center gap-2">
              <span>{network.icon}</span>
              <span>{network.name}</span>
            </span>
            {selectedNetwork.id === network.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
