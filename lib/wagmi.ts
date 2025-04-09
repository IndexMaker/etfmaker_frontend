import { createConfig, http } from "wagmi";
import { mainnet, base } from "wagmi/chains";
import { walletConnect, injected } from "wagmi/connectors";

const config = createConfig({
  chains: [mainnet, base],
  transports: {
    [mainnet.id]: http("https://mainnet.infura.io/v3/YOUR_INFURA_KEY"),
    [base.id]: http("https://mainnet.base.org"),
  },
  connectors: [
    walletConnect({ projectId: "YOUR_WALLETCONNECT_PROJECT_ID" }), // Replace with your WalletConnect ID
    injected(), // For Blockweb or MetaMask
  ],
});

export default config;