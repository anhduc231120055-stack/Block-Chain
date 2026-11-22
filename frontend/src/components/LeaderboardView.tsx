"use client";

import Image from "next/image";
import { NFTItem } from "@/types/nft";
import { LEVEL_CONFIGS } from "@/lib/constants";
import { resolveIPFS, shortenAddress } from "@/lib/utils";
import { Trophy, Medal, Swords, Shield, Zap, Flame, Crown } from "lucide-react";

interface LeaderboardViewProps {
  rankedNFTs: NFTItem[];
  userAddress?: string;
  onSelectNFT: (nft: NFTItem) => void;
}

export default function LeaderboardView({ rankedNFTs, userAddress, onSelectNFT }: LeaderboardViewProps) {
  // Level distribution stats
  const total = rankedNFTs.length || 1;
  const l1Count = rankedNFTs.filter((n) => Number(n.stats.level) === 1).length;
  const l2Count = rankedNFTs.filter((n) => Number(n.stats.level) === 2).length;
  const l3Count = rankedNFTs.filter((n) => Number(n.stats.level) === 3).length;

  return (
    <div className="space-y-6">
      {/* Header and Level Distribution Overview */}
      <div className="p-5 rounded-2xl bg-web3-card border border-web3-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-sm text-white">Bảng Xếp Hạng Lực Chiến Toàn Mạng (Hall of Fame)</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Tổng cộng: <strong className="text-white">{rankedNFTs.length}</strong> chiến binh on-chain
          </span>
        </div>

        {/* Level Distribution Multi-bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Phân Bố Cấp Độ:</span>
            <div className="flex items-center space-x-3">
              <span className="text-slate-300">Level 1: {l1Count} ({Math.round((l1Count / total) * 100)}%)</span>
              <span className="text-indigo-400">Level 2: {l2Count} ({Math.round((l2Count / total) * 100)}%)</span>
              <span className="text-amber-400">Level 3: {l3Count} ({Math.round((l3Count / total) * 100)}%)</span>
            </div>
          </div>

          <div className="w-full bg-web3-surface rounded-full h-2.5 overflow-hidden flex border border-web3-border">
            <div className="bg-slate-600 h-full" style={{ width: `${(l1Count / total) * 100}%` }} />
            <div className="bg-indigo-500 h-full" style={{ width: `${(l2Count / total) * 100}%` }} />
            <div className="bg-amber-400 h-full" style={{ width: `${(l3Count / total) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="rounded-2xl bg-web3-card border border-web3-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-web3-surface/80 border-b border-web3-border text-[11px] text-slate-400 font-mono uppercase">
              <tr>
                <th className="py-3 px-4">Hạng</th>
                <th className="py-3 px-4">Chiến Binh</th>
                <th className="py-3 px-4">Cấp Bậc</th>
                <th className="py-3 px-4 text-right">Tổng Lực Chiến</th>
                <th className="py-3 px-4 text-center">Chi Tiết (ATK / DEF / SPD)</th>
                <th className="py-3 px-4">Chủ Sở Hữu</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-web3-border/60">
              {rankedNFTs.map((nft, idx) => {
                const lvl = Number(nft.stats.level);
                const cfg = LEVEL_CONFIGS[lvl] || LEVEL_CONFIGS[1];
                const isMyNFT = userAddress && nft.owner.toLowerCase() === userAddress.toLowerCase();

                return (
                  <tr
                    key={nft.tokenId.toString()}
                    onClick={() => onSelectNFT(nft)}
                    className="hover:bg-web3-cardHover/70 transition cursor-pointer font-mono"
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 font-bold">
                      {idx === 0 ? (
                        <span className="flex items-center space-x-1 text-amber-400">
                          <Crown className="w-4 h-4" />
                          <span>#1</span>
                        </span>
                      ) : idx === 1 ? (
                        <span className="flex items-center space-x-1 text-slate-300">
                          <Medal className="w-4 h-4 text-slate-300" />
                          <span>#2</span>
                        </span>
                      ) : idx === 2 ? (
                        <span className="flex items-center space-x-1 text-amber-600">
                          <Medal className="w-4 h-4 text-amber-600" />
                          <span>#3</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 pl-1">#{idx + 1}</span>
                      )}
                    </td>

                    {/* Warrior Thumbnail + Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-web3-border">
                          <Image
                            src={resolveIPFS(nft.tokenURI, lvl)}
                            alt={cfg.name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div>
                          <span className="text-white font-sans font-bold block">{cfg.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: #{nft.tokenId.toString().padStart(3, "0")}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Level */}
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${cfg.badgeColor}`}>
                        Cấp {lvl} ({cfg.title})
                      </span>
                    </td>

                    {/* Total Combat Power */}
                    <td className="py-3 px-4 text-right">
                      <span className="font-extrabold text-amber-400 text-sm">
                        {nft.combatPower || 40} CP
                      </span>
                    </td>

                    {/* Breakdown */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-slate-300 text-[11px]">
                        <span className="text-rose-400 font-bold">{nft.stats.attack.toString()}</span> /{" "}
                        <span className="text-blue-400 font-bold">{nft.stats.defense.toString()}</span> /{" "}
                        <span className="text-emerald-400 font-bold">{nft.stats.speed.toString()}</span>
                      </span>
                    </td>

                    {/* Owner */}
                    <td className="py-3 px-4">
                      <span className={`text-[11px] ${isMyNFT ? "text-indigo-400 font-bold" : "text-slate-400"}`}>
                        {isMyNFT ? "Ví của bạn" : shortenAddress(nft.owner, 4)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
