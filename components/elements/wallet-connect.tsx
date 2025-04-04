"use client";

import onboard from "@/lib/blocknative/web3-onboard";
import { useState } from "react";

export default function WalletConnect() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [wallet, setWallet] = useState<any>(null);

  const connectWallet = async () => {
    const wallets = await onboard.connectWallet();
    if (wallets.length > 0) {
      setWallet(wallets[0]);
    }
  };

  const disconnectWallet = async () => {
    if (wallet) {
      await onboard.disconnectWallet({ label: wallet.label });
      setWallet(null);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {wallet ? (
        <>
          <p className="text-green-500">Connected: {wallet.accounts[0].address}</p>
          <button onClick={disconnectWallet} className="px-4 py-2 bg-red-500 text-white rounded-md">
            Disconnect
          </button>
        </>
      ) : (
        <button onClick={connectWallet} className="px-4 py-2 bg-blue-500 text-white rounded-md">
          Connect Wallet
        </button>
      )}
    </div>
  );
}
