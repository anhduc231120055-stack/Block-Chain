import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  injectedWallet,
  coinbaseWallet,
  rainbowWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// If user provides a real WalletConnect project ID, include it; otherwise use injected wallets
// to avoid background WebSocket connection drops on localhost.
const defaultWallets = [metaMaskWallet, injectedWallet, coinbaseWallet, rainbowWallet];

if (projectId && projectId.trim().length > 10) {
  defaultWallets.push(walletConnectWallet);
}

const connectors = connectorsForWallets(
  [
    {
      groupName: "Ví Khuyên Dùng (Recommended)",
      wallets: defaultWallets,
    },
  ],
  {
    appName: "Dynamic NFT Evolution",
    projectId: projectId || "3a8170812b534d0ff9d794f168a3dccb",
  }
);

export const config = createConfig({
  connectors,
  chains: [hardhat, sepolia],
  transports: {
    [hardhat.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http(),
  },
  ssr: true,
});
