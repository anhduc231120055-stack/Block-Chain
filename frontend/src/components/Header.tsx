"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Shield, Sparkles, ShoppingBag, Trophy, Activity, BookOpen, ExternalLink } from "lucide-react";
import { useChainId } from "wagmi";
import { useNFTContractAddress } from "@/hooks/useNFTContract";
import { useMarketplaceAddress } from "@/hooks/useMarketplace";
import { shortenAddress } from "@/lib/utils";
import { APP_NAME, APP_VERSION } from "@/lib/constants";

export type NavTab = "inventory" | "marketplace" | "leaderboard" | "activity" | "thesis";

interface HeaderProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userNFTCount: number;
  marketCount: number;
  currentBlock: number;
}

export default function Header({
  activeTab,
  onTabChange,
  userNFTCount,
  marketCount,
  currentBlock,
}: HeaderProps) {
  const chainId = useChainId();
  const nftAddress = useNFTContractAddress();
  const marketplaceAddress = useMarketplaceAddress();

  const isSepolia = chainId === 11155111;

  const tabs: { id: NavTab; label: string; icon: any; count?: number }[] = [
    { id: "inventory", label: "Kho Đồ & Tiến Hóa", icon: Shield, count: userNFTCount },
    { id: "marketplace", label: "Chợ Giao Dịch", icon: ShoppingBag, count: marketCount },
    { id: "leaderboard", label: "Bảng Xếp Hạng", icon: Trophy },
    { id: "activity", label: "Sổ Cái On-Chain", icon: Activity },
    { id: "thesis", label: "Thẩm Định VRF & Đồ Án", icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-web3-bg/95 backdrop-blur-md border-b border-web3-border">
      {/* Top micro-bar: Network status & Block info */}
      <div className="border-b border-web3-border/60 bg-web3-surface/50 text-[11px] text-slate-400 py-1 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex items-center space-x-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-semibold">{isSepolia ? "Sepolia Testnet" : "Hardhat Localhost"}</span>
              <span className="text-slate-500">({chainId})</span>
            </span>

            {currentBlock > 0 && (
              <span className="hidden sm:inline font-mono text-slate-500">
                • Khối: <span className="text-slate-300 font-semibold">#{currentBlock}</span>
              </span>
            )}

            <span className="hidden md:inline font-mono text-slate-500">
              • NFT: <span className="text-slate-400">{shortenAddress(nftAddress, 4)}</span>
            </span>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-web3-border font-mono">{APP_VERSION}</span>
            <span className="hidden sm:inline text-slate-500">Đồ Án Môn Học Blockchain • ĐH Điện Lực</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-wide text-white uppercase">
                {APP_NAME}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                dNFT v2
              </span>
            </div>
          </div>
        </div>

        {/* Center: Clean Modern Navigation Tabs */}
        <nav className="hidden lg:flex items-center space-x-1 bg-web3-card/60 p-1 rounded-xl border border-web3-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? "bg-web3-cardActive text-white border border-web3-borderHighlight shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-web3-cardHover/50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-slate-500"}`} />
                <span>{tab.label}</span>
                {typeof tab.count === "number" && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? "bg-indigo-500/20 text-indigo-300" : "bg-web3-border text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: RainbowKit Connect Button */}
        <div className="flex items-center space-x-2 shrink-0">
          <ConnectButton
            showBalance={{ smallScreen: false, largeScreen: true }}
            chainStatus="icon"
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
          />
        </div>
      </div>

      {/* Mobile Navigation Tabs (visible on < lg screens) */}
      <div className="lg:hidden flex items-center overflow-x-auto no-scrollbar border-t border-web3-border/80 px-4 py-2 space-x-1 bg-web3-surface">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                isActive
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
