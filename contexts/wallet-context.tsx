// contexts/wallet-context.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import onboard from '@/lib/blocknative/web3-onboard';
import { shortenAddress } from '@/lib/utils';
import { getAddress } from 'ethers';

type WalletState = {
  label: string;
  icon: string;
  accounts: {
    address: string;
    ens?: { name?: string; avatar?: string };
    balance?: Record<string, string>;
  }[];
  chains: { id: string }[];
};

type WalletContextType = {
  wallet: WalletState | null;
  isConnected: boolean;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  switchNetwork: (chainId: string) => Promise<void>;
  switchWallet: () => Promise<void>;
  address: string | null;
  displayAddress: string | null;
  chainId: string | null;
  isAdmin: boolean;
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // Track hydration

  const isConnected = !!wallet;
  const address = wallet?.accounts[0]?.address || null;
  const displayAddress = address ? shortenAddress(address) : null;
  const isAdmin = address ? getAddress(address) === getAddress(process.env.NEXT_PUBLIC_ADMIN_ADDRESS!) : false
  // Initialize wallet connection and subscribe to changes
  useEffect(() => {
    let unsubscribe: any;

    const init = async () => {
      // Wait briefly for Web3-Onboard to hydrate from storage
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // First check - after potential hydration delay
      const initialWallets = onboard.state.get().wallets;
      console.log(initialWallets)
      if (initialWallets.length > 0) {
        updateWalletState(initialWallets[0]);
      }

      // Set up subscription for future changes
      unsubscribe = onboard.state.select('wallets').subscribe((wallets) => {
        const wallet = wallets[0] || null;
        setWallet(wallet as WalletState);
        setChainId(wallet?.chains[0]?.id || null);
      });

      setIsInitialized(true);
    };

    init();

    return () => {
      unsubscribe?.();
    };
  }, []);

  const updateWalletState = (walletState: any) => {
    const { label, icon, accounts, chains } = walletState;
    setWallet({ label, icon, accounts, chains });
    setChainId(chains[0]?.id || null);
  };

  const connectWallet = useCallback(async () => {
    if (isConnected) return;

    try {
      setConnecting(true);
      const wallets = await onboard.connectWallet();
      
      if (wallets.length > 0) {
        updateWalletState(wallets[0]);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    } finally {
      setConnecting(false);
    }
  }, [isConnected]);

  const disconnectWallet = useCallback(async () => {
    if (!wallet) return;

    try {
      await onboard.disconnectWallet({ label: wallet.label });
      // State will be updated via subscription
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  }, [wallet]);

  const switchNetwork = useCallback(async (chainId: string) => {
    if (!isConnected) return;

    try {
      await onboard.setChain({ chainId });
      // Chain ID will be updated via subscription
    } catch (error) {
      console.error('Error switching network:', error);
      throw error;
    }
  }, [isConnected]);

  const switchWallet = useCallback(async () => {
    if (wallet) {
      await disconnectWallet();
    }
    await connectWallet();
  }, [wallet, disconnectWallet, connectWallet]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isConnected,
        connecting,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        switchWallet,
        address,
        displayAddress,
        chainId,
        isAdmin
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};