import { createPublicClient, http } from "viem";
import { mainnet, base } from "viem/chains";

// Map chain IDs to Viem chains
const chainMap = {
  "0x1": mainnet, // Ethereum Mainnet
  "0x2105": base, // Base Mainnet
};

export const getViemClient = (chainId: string) => {
  const chain = chainMap[chainId as keyof typeof chainMap] || mainnet; // Default to mainnet if unknown
  return createPublicClient({
    chain,
    transport: http(), // Uses default RPC URL for the chain
  });
};
