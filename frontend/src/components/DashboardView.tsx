"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Search,
  Moon,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { NFTItem } from "@/types/nft";
import { ActivityEvent } from "@/types/nft";
import { LEVEL_CONFIGS } from "@/lib/constants";
import { resolveIPFS, shortenAddress } from "@/lib/utils";
import { formatEther } from "viem";

interface DashboardViewProps {
  userAddress?: string;
  userNFTs: NFTItem[];
  allNFTs: NFTItem[];
  activities: ActivityEvent[];
  selectedNFT: NFTItem | null;
  onSelectNFT: (nft: NFTItem) => void;
  onNavigateToTab: (tab: "inventory" | "marketplace" | "activity") => void;
}

export default function DashboardView({
  userAddress,
  userNFTs,
  allNFTs,
  activities,
  selectedNFT,
  onSelectNFT,
  onNavigateToTab,
}: DashboardViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Items to display in carousel / grid: prioritize user's NFTs, fallback to all NFTs
  const displayItems = userNFTs.length > 0 ? userNFTs : allNFTs;

  const filteredItems = displayItems.filter((nft) => {
    const q = searchQuery.toLowerCase();
    const tokenIdStr = `#${nft.tokenId.toString()}`;
    const levelName = LEVEL_CONFIGS[Number(nft.stats.level)]?.name.toLowerCase() || "";
    return tokenIdStr.includes(q) || levelName.includes(q) || nft.tokenId.toString() === q;
  });

  // Color theme per level matching the reference image's vibrant cards
  const getCardTheme = (level: number) => {
    switch (level) {
      case 2:
        return {
          bgGradient: "from-lime-500/20 via-emerald-900/30 to-slate-900/90",
          cardAccent: "border-lime-500/40 hover:border-lime-400",
          pillBg: "bg-lime-500/15 text-lime-300 border-lime-500/30",
          avatarBg: "bg-emerald-900/60",
        };
      case 3:
        return {
          bgGradient: "from-amber-500/20 via-yellow-900/30 to-slate-900/90",
          cardAccent: "border-amber-500/40 hover:border-amber-400",
          pillBg: "bg-amber-500/15 text-amber-300 border-amber-500/30",
          avatarBg: "bg-amber-950/60",
        };
      default:
        // Level 1: Berry / Rose
        return {
          bgGradient: "from-pink-500/20 via-rose-900/30 to-slate-900/90",
          cardAccent: "border-pink-500/40 hover:border-pink-400",
          pillBg: "bg-pink-500/15 text-pink-300 border-pink-500/30",
          avatarBg: "bg-rose-950/60",
        };
    }
  };

  const getEventBadge = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "BOUGHT":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">Purchase</span>;
      case "LISTED":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">List</span>;
      case "LEVEL_UP":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Evolve VRF</span>;
      case "VRF_REQUEST":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">VRF Roll</span>;
      case "TRAIN":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Train (+25)</span>;
      case "MINT":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Mint</span>;
      case "TRANSFER":
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-500/20 text-slate-400 border border-slate-500/30">Transfer</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400">Event</span>;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Top Header inside main view */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400">
            Chào mừng trở lại{userAddress ? `, ${shortenAddress(userAddress)} 👋` : ""}
          </p>
          <div className="flex items-center space-x-3 mt-1">
            <h1 className="text-2xl font-black text-white tracking-tight">Dashboard Tổng Quan</h1>
          </div>
        </div>

        {/* Right Search & Controls */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm Token #ID, cấp độ..."
              className="pl-10 pr-4 py-2 text-xs rounded-full bg-uifry-pill/80 border border-uifry-border text-slate-200 placeholder-slate-500 focus:outline-none focus:border-uifry-blue focus:ring-1 focus:ring-uifry-blue w-64 transition"
            />
          </div>

          <div className="p-2 rounded-full bg-uifry-pill/80 border border-uifry-border text-slate-400 hover:text-white cursor-pointer transition">
            <Moon className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* SECTION 1: Your Collectibles (Cards Carousel / Grid) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Chiến Binh Của Bạn</h2>
            <span className="text-xs text-slate-400 font-mono">({displayItems.length})</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => onNavigateToTab("inventory")}
              className="text-xs font-semibold text-uifry-blue hover:text-blue-400 transition"
            >
              Xem Tất Cả
            </button>
            <div className="flex items-center space-x-1.5">
              <button className="p-1.5 rounded-full bg-uifry-pill border border-uifry-border text-slate-400 hover:text-white transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-full bg-uifry-pill border border-uifry-border text-slate-400 hover:text-white transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Collectibles Cards Grid matching Reference Image */}
        {filteredItems.length === 0 ? (
          <div className="bg-uifry-card rounded-3xl p-8 text-center border border-uifry-border text-slate-400">
            <p className="text-sm">Chưa tìm thấy chiến binh phù hợp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.slice(0, 3).map((nft) => {
              const level = Number(nft.stats.level);
              const config = LEVEL_CONFIGS[level] || LEVEL_CONFIGS[1];
              const theme = getCardTheme(level);
              const isSelected = selectedNFT?.tokenId === nft.tokenId;
              const imageSrc = resolveIPFS(nft.tokenURI, level);

              return (
                <div
                  key={nft.tokenId.toString()}
                  onClick={() => {
                    onSelectNFT(nft);
                    onNavigateToTab("inventory");
                  }}
                  className={`group relative rounded-3xl p-4 bg-uifry-card border transition-all duration-300 cursor-pointer card-hover-effect overflow-hidden ${
                    isSelected
                      ? "border-uifry-blue ring-2 ring-blue-500/40 shadow-uifry-blue"
                      : `${theme.cardAccent}`
                  }`}
                >
                  {/* Character visual box with vivid background */}
                  <div
                    className={`relative w-full h-56 rounded-2xl overflow-hidden mb-3.5 bg-gradient-to-b ${theme.bgGradient} flex items-center justify-center border border-white/5`}
                  >
                    <Image
                      src={imageSrc}
                      alt={config.name}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Pill Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-2.5 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-white font-mono border border-white/10">
                        #{nft.tokenId.toString().padStart(3, "0")}
                      </span>
                      <span className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-md border ${theme.pillBg}`}>
                        {config.title} Lv.{level}
                      </span>
                    </div>
                  </div>

                  {/* Character Name & Token Info */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition">
                          {config.name}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-400">
                          #{nft.tokenId.toString().padStart(3, "0")}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-amber-400 font-mono">
                          ⚡ {nft.combatPower || 100} CP
                        </span>
                      </div>
                    </div>

                    {/* Blue Action Pill at bottom matching reference design */}
                    <div className="flex items-center justify-between p-2.5 rounded-2xl bg-uifry-pill border border-uifry-border/70 group-hover:border-blue-500/40 transition">
                      <span className="text-xs font-semibold text-slate-300">
                        {nft.listing?.isActive ? "Đang Bán Sàn" : "Trạng Thái"}
                      </span>
                      <span className="px-3 py-1 rounded-xl bg-uifry-blue text-white text-xs font-bold font-mono shadow-sm flex items-center space-x-1">
                        <span>
                          {nft.listing?.isActive
                            ? `${formatEther(nft.listing.price)} ETH`
                            : `${Number(nft.stats.exp)} EXP`}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Recent Activity Table matching Reference Image */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Hoạt Động Gần Đây</h2>
            <span className="text-xs text-slate-400 font-mono">({activities.length} sự kiện)</span>
          </div>

          <button
            onClick={() => onNavigateToTab("activity")}
            className="text-xs font-semibold text-uifry-blue hover:text-blue-400 transition"
          >
            Xem Chi Tiết Sổ Cái
          </button>
        </div>

        {/* Activity Table Container */}
        <div className="bg-uifry-card rounded-3xl border border-uifry-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-uifry-pill/40 border-b border-uifry-border text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-5">Sự Kiện</th>
                  <th className="py-3.5 px-4">Chiến Binh</th>
                  <th className="py-3.5 px-4">Từ / Đến</th>
                  <th className="py-3.5 px-4">Giá Trị</th>
                  <th className="py-3.5 px-5 text-right">Khối / Giờ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-uifry-border/60">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Chưa có hoạt động on-chain nào được ghi nhận.
                    </td>
                  </tr>
                ) : (
                  activities.slice(0, 5).map((act, idx) => (
                    <tr key={`${act.txHash}-${idx}`} className="hover:bg-uifry-pill/30 transition">
                      {/* Event badge */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {getEventBadge(act.type)}
                      </td>

                      {/* Item */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-[10px] text-blue-300">
                            #{act.tokenId.toString()}
                          </div>
                          <span className="font-semibold text-slate-200">
                            dNFT #{act.tokenId.toString()}
                          </span>
                        </div>
                      </td>

                      {/* From / To Address Pills */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px]">
                        <div className="flex items-center space-x-1.5 text-slate-400">
                          <span className="px-2 py-0.5 rounded-lg bg-uifry-pill border border-uifry-border text-slate-300">
                            {act.from ? shortenAddress(act.from) : "Hệ Thống"}
                          </span>
                          {act.to && (
                            <>
                              <ArrowRight className="w-3 h-3 text-slate-500" />
                              <span className="px-2 py-0.5 rounded-lg bg-uifry-pill border border-uifry-border text-slate-300">
                                {shortenAddress(act.to)}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Value / Info */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-200">
                        {act.price
                          ? `${formatEther(act.price)} ETH`
                          : act.extra
                          ? act.extra
                          : "—"}
                      </td>

                      {/* Time / Block */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap font-mono text-[11px] text-slate-400">
                        Khối #{act.blockNumber}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
