"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { ethers } from "ethers";
import { initAarc } from "@/lib/aarc/aarc-client";

type AarcContextType = {
  address: string | null;
  chainId: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  payWithCard: (tx: { to: string; data: string; value?: string }) => Promise<any>;
  provider: ethers.BrowserProvider | null;
};

const AarcContext = createContext<AarcContextType | undefined>(undefined);

export const AarcProvider = ({ children }: { children: React.ReactNode }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const aarcClient = initAarc()
  useEffect(() => {
    //   initAarc().catch(console.error);
  }, []);

  const connectWallet = useCallback(async () => {
    try {
      const wallet = await aarcClient.connectWallet();
      if (wallet?.provider) {
        const browserProvider = new ethers.BrowserProvider(wallet.provider);
        const signer = await browserProvider.getSigner();
        const address = await signer.getAddress();
        const network = await browserProvider.getNetwork();

        setAddress(address);
        setChainId(network.chainId.toString());
        setProvider(browserProvider);
      }
    } catch (err) {
      console.error("Aarc wallet connection failed:", err);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    aarcClient.disconnectWallet();
    setAddress(null);
    setChainId(null);
    setProvider(null);
  }, []);

  const payWithCard = useCallback(
    async ({ to, data, value = "0" }: { to: string; data: string; value?: string }) => {
      if (!address || !chainId) {
        throw new Error("Wallet not connected");
      }

      try {
        const result = await aarcClient.open({
          chainId,
          user: { address },
          transaction: { to, data, value },
          paymentMethod: "card",
          requireKyc: true,
        });

        return result;
      } catch (err) {
        console.error("Card payment failed:", err);
        throw err;
      }
    },
    [address, chainId]
  );

  return (
    <AarcContext.Provider
      value={{ address, chainId, connectWallet, disconnectWallet, payWithCard, provider }}
    >
      {children}
    </AarcContext.Provider>
  );
};

export const useAarc = () => {
  const context = useContext(AarcContext);
  if (!context) {
    throw new Error("useAarc must be used within <AarcProvider>");
  }
  return context;
};
