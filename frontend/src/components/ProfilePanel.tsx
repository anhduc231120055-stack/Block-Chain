"use client";

import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  MoreVertical,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  Zap,
  TrendingUp,
  Shield,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { shortenAddress } from "@/lib/utils";
import { useBalance } from "wagmi";
import { useNFTContract } from "@/hooks/useNFTContract";
import { NFTItem } from "@/types/nft";

interface ProfilePanelProps {
  userAddress?: string;
  userNFTs: NFTItem[];
  allNFTs: NFTItem[];
  onOpenTransfer: () => void;
  onNavigateToLeaderboard: () => void;
  onRefresh: () => void;
}

export default function ProfilePanel({
  userAddress,
  userNFTs,
  allNFTs,
  onOpenTransfer,
  onNavigateToLeaderboard,
  onRefresh,
}: ProfilePanelProps) {
  const [copied, setCopied] = useState(false);
  const { data: balanceData } = useBalance({
    address: userAddress as `0x${string}` | undefined,
  });

  const { mintNFT, isPending: isMintPending, isConfirming: isMintConfirming } = useNFTContract();
  const isMinting = isMintPending || isMintConfirming;

  const handleCopy = () => {
    if (userAddress) {
      navigator.clipboard.writeText(userAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleQuickMint = async () => {
    if (!userAddress) return;
    try {
      await mintNFT(userAddress as `0x${string}`);
      onRefresh();
    } catch (err) {
      console.error("Mint error:", err);
    }
  };

  // Top combat power in user's roster
  const maxCP = userNFTs.reduce((max, nft) => Math.max(max, nft.combatPower || 0), 0);
  const formattedBalance = balanceData
    ? Number(balanceData.formatted).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      })
    : "0.00";

  return (
    <aside className="w-80 flex-shrink-0 flex flex-col p-5 bg-uifry-sidebar/90 border-l border-uifry-border/70 backdrop-blur-xl space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white tracking-wide">Hồ Sơ Của Bạn</h2>
        <div className="p-1.5 rounded-xl hover:bg-uifry-pill/60 text-slate-400 hover:text-white cursor-pointer transition">
          <MoreVertical className="w-4 h-4" />
        </div>
      </div>

      {/* User Avatar & Identity */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="relative group">
          <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-blue-600 via-cyan-400 to-indigo-600 shadow-lg shadow-blue-500/20">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-2 border-slate-950">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-200 bg-clip-text text-transparent">
                {userAddress ? userAddress.slice(2, 4).toUpperCase() : "WO"}
              </span>
            </div>
          </div>
          <span className="absolute bottom-0 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-[9px] font-bold text-white">
            ✓
          </span>
        </div>

        <div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 text-xs font-mono font-medium text-slate-300 hover:text-white transition px-2.5 py-1 rounded-full bg-uifry-pill/80 border border-uifry-border"
          >
            <span>{userAddress ? `@${shortenAddress(userAddress)}` : "Chưa kết nối ví"}</span>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Total Balance Card */}
      <div className="bg-uifry-card rounded-3xl p-5 border border-uifry-border shadow-uifry-card space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-400">Tổng Số Dư Khả Dụng</p>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              {formattedBalance} ETH
            </span>
          </div>
          <div className="flex items-center space-x-1.5 mt-1.5">
            <span className="flex items-center text-xs font-semibold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +100%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">(Mạng Localhost Testnet)</span>
          </div>
        </div>

        {/* 3 Quick Action Buttons */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-uifry-border/60">
          {/* Quick Mint */}
          <button
            onClick={handleQuickMint}
            disabled={!userAddress || isMinting}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-uifry-pill hover:bg-uifry-blue hover:text-white text-slate-300 transition-all duration-200 group disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 group-hover:bg-white/20 flex items-center justify-center mb-1 text-blue-400 group-hover:text-white transition">
              {isMinting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            </div>
            <span className="text-[11px] font-semibold">Đúc NFT</span>
          </button>

          {/* Transfer */}
          <button
            onClick={onOpenTransfer}
            disabled={!userAddress || userNFTs.length === 0}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-uifry-pill hover:bg-uifry-blue hover:text-white text-slate-300 transition-all duration-200 group disabled:opacity-50"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 group-hover:bg-white/20 flex items-center justify-center mb-1 text-indigo-400 group-hover:text-white transition">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold">Chuyển</span>
          </button>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-uifry-pill hover:bg-uifry-blue hover:text-white text-slate-300 transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 group-hover:bg-white/20 flex items-center justify-center mb-1 text-cyan-400 group-hover:text-white transition">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold">Đồng Bộ</span>
          </button>
        </div>
      </div>

      {/* Latest Status Mini Card */}
      <div className="bg-uifry-card rounded-3xl p-4 border border-uifry-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Chiến Lực Cao Nhất</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold">
            On-Chain
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-black text-white font-mono">
              {maxCP > 0 ? `${maxCP} CP` : "Chưa có NFT"}
            </div>
            <p className="text-[11px] text-slate-400">
              Sở hữu: <span className="text-slate-200 font-semibold">{userNFTs.length} dNFT</span>
            </p>
          </div>
        </div>
      </div>

      {/* Analytics Card with Mini SVG Wave Chart */}
      <div className="bg-uifry-card rounded-3xl p-4 border border-uifry-border space-y-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Phân Tích Chỉ Số</span>
            <span className="text-xs font-mono font-bold text-white">
              {allNFTs.length} Tổng dNFT
            </span>
          </div>

          {/* Decorative Sparkline Chart */}
          <div className="h-16 w-full relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,35 Q20,20 35,28 T70,12 T100,5 L100,40 L0,40 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M0,35 Q20,20 35,28 T70,12 T100,5"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="100" cy="5" r="3" fill="#60a5fa" />
            </svg>
          </div>
        </div>

        <button
          onClick={onNavigateToLeaderboard}
          className="w-full py-2.5 rounded-2xl bg-uifry-blue hover:bg-uifry-blue-hover text-white text-xs font-bold transition shadow-uifry-blue"
        >
          Xem Bảng Xếp Hạng
        </button>
      </div>

      {/* RainbowKit Wallet Connect Pill */}
      <div className="pt-2">
        <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" />
      </div>
    </aside>
  );
}
