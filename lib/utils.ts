import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address: string, chars = 4) {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export const fetchUsdPrice = async (symbol: string) => {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd`
  );
  const data = await res.json();
  return data?.[symbol]?.usd ?? 0;
};

export const getERC20AddressForIndex = (
  indexId: number
):string => {
  const indexTokenAddressMap: Record<number, string> = {
    // 6: '0xac2125c4a6c7e7562cdf605fcac9f32cd9effef2', // replace with actual deployed token addresses
    // 7: '0x8fcf91497b456e63e15837db49411a0cce1ae1d0',
    // 10: '0x9159EE5fa46c50209Af08d1A7AD80232204e57e8',
    // 16: '0xbe80abd52db5e2b304366669040691b1328b238d',
    // 20: '0x532a1D3B2fe237363BA67B3BC14ED559b56cb2D9',
    21: "0x03a4Ba7e555330a0631F457BA55b751785DEe091",
    22: "0xbd37644c8b17a985fed58e172a7e1f8383f7fc2a",
    23: "0x53d33bc96769bb1a22d093f0cf113d98270c7835",
    24: "0x61bda4131ed4c607e430000a5f9da800cbdd6dbd", // 0xd6b8820a14a781a4b2ddeedec2deb5ee898ae426
    25: "0x7C139e501821A9ab4F5a8f9F67c6F2fca3d6dAe4",
    26: "0xb57D8f4A8dC391E04bEA550DD6FbcBa25938162c",
  };
  const address = indexTokenAddressMap[indexId];
  if (!address) {
    console.log(`ERC20 address not found for indexId: ${indexId}`);
    return '';
  }
  return address;
};
