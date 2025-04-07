"use client";

import { useEffect, useState } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
const networks = [
  {
    id: "mainnet",
    name: "Ethereum",
    chainId: "0x1",
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
    chainId: "0x2105",
    icon: <Image src={Base} alt={"Base"} width={17} height={17} />,
  },
];

export function NetworkSwitcher() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get network from URL or default to Ethereum
  const defaultNetwork =
    networks.find((n) => n.id === searchParams.get("network")) || networks[0];
  const [selectedNetwork, setSelectedNetwork] = useState(defaultNetwork);

  useEffect(() => {
    // Update the URL without reloading the page
    const url = new URL(window.location.href);
    url.searchParams.set("network", selectedNetwork.id);
    router.replace(url.toString(), { scroll: false });
  }, [selectedNetwork, router]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="px-0">
        <Button
          variant="outline"
          className="flex rounded-[4px] cursor-pointer text-xs line-[16px] items-center w-[46px] has-[>svg]:px-1 m-auto max-h-[26px] border-none text-primary hover:text-white hover:bg-[#fafafa1a] gap-1 hover:border-none shadow-none !bg-transparent md:!bg-foreground"
        >
          <span className="flex items-center">
            <span>{selectedNetwork.icon}</span>
          </span>
          <ChevronDown className="h-4 w-4 opacity-50 text-secondary hidden md:flex" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[200px] bg-foreground border-none text-[11px] text-secondary"
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
