"use client";

import { useState } from "react";
import Image from "next/image";
import { NFTItem } from "@/types/nft";
import { LEVEL_CONFIGS } from "@/lib/constants";
import { resolveIPFS, shortenAddress, getExpProgress } from "@/lib/utils";
import { useNFTContract } from "@/hooks/useNFTContract";
import TransferModal from "./TransferModal";
import ListModal from "./ListModal";
import {
  Shield,
  Sparkles,
  Zap,
  Swords,
  Dumbbell,
  Tag,
  Send,
  Loader2,
  ExternalLink,
  PlusCircle,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

interface InventoryViewProps {
  userNFTs: NFTItem[];
  allNFTs: NFTItem[];
  selectedNFT: NFTItem | null;
  onSelectNFT: (nft: NFTItem) => void;
  userAddress?: string;
  onRefresh: () => void;
}

export default function InventoryView({
  userNFTs,
  allNFTs,
  selectedNFT,
  onSelectNFT,
  userAddress,
  onRefresh,
}: InventoryViewProps) {
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [filterLevel, setFilterLevel] = useState<number>(0); // 0 = all
  const [actionError, setActionError] = useState<string | null>(null);

  const { mintNFT, trainNFT, requestLevelUp, isPending, isConfirming } = useNFTContract();
  const isLoading = isPending || isConfirming;

  const currentLevel = selectedNFT ? Number(selectedNFT.stats.level) : 1;
  const currentConfig = LEVEL_CONFIGS[currentLevel] || LEVEL_CONFIGS[1];
  const isOwner = !!userAddress && !!selectedNFT && selectedNFT.owner.toLowerCase() === userAddress.toLowerCase();

  const progress = selectedNFT
    ? getExpProgress(currentLevel, Number(selectedNFT.stats.exp))
    : { current: 0, max: 100, percent: 0, isReady: false, isMax: false };

  // Handle Mint Novice
  const handleMint = async () => {
    if (!userAddress) return;
    try {
      setActionError(null);
      await mintNFT(userAddress as `0x${string}`);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setActionError(err?.shortMessage || err?.message || "Đúc NFT thất bại");
    }
  };

  // Handle Train
  const handleTrain = async () => {
    if (!selectedNFT) return;
    try {
      setActionError(null);
      await trainNFT(selectedNFT.tokenId);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setActionError(err?.shortMessage || err?.message || "Rèn luyện thất bại");
    }
  };

  // Handle Evolve (VRF)
  const handleEvolve = async () => {
    if (!selectedNFT) return;
    try {
      setActionError(null);
      await requestLevelUp(selectedNFT.tokenId);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setActionError(err?.shortMessage || err?.message || "Yêu cầu tiến hóa thất bại");
    }
  };

  // Filter user list
  const filteredUserNFTs = userNFTs.filter((nft) =>
    filterLevel === 0 ? true : Number(nft.stats.level) === filterLevel
  );

  return (
    <div className="space-y-6">
      {/* Top Banner: Mint Callout & Stats Bar */}
      <div className="p-5 rounded-2xl bg-web3-card border border-web3-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Shield className="w-4 h-4" />
            </span>
            <h2 className="font-bold text-sm text-white">Kho Đồ Chiến Binh Cá Nhân (My Warriors)</h2>
          </div>
          <p className="text-xs text-slate-400">
            Bạn đang sở hữu <strong>{userNFTs.length}</strong> chiến binh. Triệu hồi tân binh mới để bắt đầu quá trình rèn luyện và tiến hóa ngẫu nhiên qua Chainlink VRF.
          </p>
        </div>

        <button
          onClick={handleMint}
          disabled={!userAddress || isLoading}
          className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-xs font-bold text-white transition flex items-center justify-center space-x-2 shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang gửi giao dịch...</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              <span>Triệu Hồi Tân Binh (Mint Level 1)</span>
            </>
          )}
        </button>
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Main Split: Left selected details deck, Right inventory list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Detailed Deck for Active Warrior */}
        {selectedNFT ? (
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl bg-web3-card border border-web3-border overflow-hidden">
              {/* Header tags */}
              <div className="p-3.5 border-b border-web3-border flex items-center justify-between bg-web3-surface/50">
                <span className="font-mono text-xs font-semibold text-slate-300">
                  TOKEN #{selectedNFT.tokenId.toString().padStart(3, "0")}
                </span>

                <div className="flex items-center space-x-2">
                  {selectedNFT.listing?.isActive && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      Đang bán: {Number(selectedNFT.listing.price) / 1e18} ETH
                    </span>
                  )}
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${currentConfig.badgeColor}`}>
                    Cấp {currentLevel}: {currentConfig.title}
                  </span>
                </div>
              </div>

              {/* Artwork */}
              <div className="relative aspect-[4/5] w-full bg-slate-950">
                <Image
                  src={resolveIPFS(selectedNFT.tokenURI, currentLevel)}
                  alt={currentConfig.name}
                  fill
                  priority
                  className="object-cover object-center"
                  unoptimized
                />

                {selectedNFT.stats.isEvolving && (
                  <div className="absolute inset-0 bg-indigo-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                    <span className="font-mono font-bold text-xs text-white">ORACLE VRF CALLBACK...</span>
                    <span className="text-[11px] text-slate-300 mt-1">Đang xác minh số ngẫu nhiên 256-bit</span>
                  </div>
                )}
              </div>

              {/* Stats Matrix */}
              <div className="p-4 space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <h3 className="font-bold text-white text-base">{currentConfig.name}</h3>
                    <p className="text-[11px] text-slate-400">{currentConfig.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Tổng Lực Chiến</span>
                    <span className="font-mono font-extrabold text-amber-400 text-base">
                      {selectedNFT.combatPower || 40} CP
                    </span>
                  </div>
                </div>

                {/* Stat rows */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-web3-surface border border-web3-border">
                    <div className="flex items-center justify-center space-x-1 text-rose-400 mb-0.5">
                      <Swords className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase font-bold">ATK</span>
                    </div>
                    <span className="font-mono font-bold text-white text-sm">
                      {selectedNFT.stats.attack.toString()}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-web3-surface border border-web3-border">
                    <div className="flex items-center justify-center space-x-1 text-blue-400 mb-0.5">
                      <Shield className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase font-bold">DEF</span>
                    </div>
                    <span className="font-mono font-bold text-white text-sm">
                      {selectedNFT.stats.defense.toString()}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-web3-surface border border-web3-border">
                    <div className="flex items-center justify-center space-x-1 text-emerald-400 mb-0.5">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase font-bold">SPD</span>
                    </div>
                    <span className="font-mono font-bold text-white text-sm">
                      {selectedNFT.stats.speed.toString()}
                    </span>
                  </div>
                </div>

                {/* EXP Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Tiến Trình EXP:</span>
                    <span className="text-slate-200 font-semibold">
                      {selectedNFT.stats.exp.toString()} / {progress.max} EXP
                    </span>
                  </div>
                  <div className="w-full bg-web3-surface rounded-full h-2 overflow-hidden border border-web3-border">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        progress.isReady ? "bg-amber-400" : "bg-indigo-500"
                      }`}
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                </div>

                {/* 4 Actions Button Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {/* Train */}
                  <button
                    onClick={handleTrain}
                    disabled={!isOwner || progress.isMax || selectedNFT.stats.isEvolving || isLoading}
                    className="p-2.5 rounded-xl bg-web3-surface border border-web3-border hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-white flex items-center justify-center space-x-1.5 transition"
                  >
                    <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Rèn Luyện (+25)</span>
                  </button>

                  {/* Evolve */}
                  <button
                    onClick={handleEvolve}
                    disabled={!isOwner || !progress.isReady || progress.isMax || selectedNFT.stats.isEvolving || isLoading}
                    className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 hover:bg-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-indigo-300 flex items-center justify-center space-x-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tiến Hóa VRF</span>
                  </button>

                  {/* List for Sale */}
                  <button
                    onClick={() => setIsListOpen(true)}
                    disabled={!isOwner || selectedNFT.listing?.isActive || isLoading}
                    className="p-2.5 rounded-xl bg-web3-surface border border-web3-border hover:border-amber-500/50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center space-x-1.5 transition"
                  >
                    <Tag className="w-3.5 h-3.5 text-amber-400" />
                    <span>{selectedNFT.listing?.isActive ? "Đã Niêm Yết" : "Đăng Bán"}</span>
                  </button>

                  {/* Transfer */}
                  <button
                    onClick={() => setIsTransferOpen(true)}
                    disabled={!isOwner || isLoading}
                    className="p-2.5 rounded-xl bg-web3-surface border border-web3-border hover:border-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-300 hover:text-white flex items-center justify-center space-x-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5 text-slate-400" />
                    <span>Chuyển Nhượng</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-5 p-8 rounded-2xl bg-web3-card border border-web3-border text-center text-slate-400 text-xs">
            Chọn một chiến binh bên phải để xem chi tiết và thao tác.
          </div>
        )}

        {/* Right: User's Warriors Inventory Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-web3-border">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
              Danh Sách Sở Hữu ({filteredUserNFTs.length})
            </h3>

            {/* Level Filters */}
            <div className="flex items-center space-x-1 text-xs">
              {[
                { label: "Tất cả", lvl: 0 },
                { label: "Cấp 1", lvl: 1 },
                { label: "Cấp 2", lvl: 2 },
                { label: "Cấp 3", lvl: 3 },
              ].map((f) => (
                <button
                  key={f.lvl}
                  onClick={() => setFilterLevel(f.lvl)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    filterLevel === f.lvl
                      ? "bg-indigo-600 text-white"
                      : "bg-web3-surface text-slate-400 hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredUserNFTs.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-web3-card/50 border border-dashed border-web3-border text-xs text-slate-400 space-y-2">
              <p>Chưa có chiến binh nào trong danh mục này.</p>
              <button
                onClick={handleMint}
                className="text-indigo-400 hover:underline font-semibold"
              >
                + Triệu hồi chiến binh Level 1 ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredUserNFTs.map((nft) => {
                const lvl = Number(nft.stats.level);
                const cfg = LEVEL_CONFIGS[lvl] || LEVEL_CONFIGS[1];
                const isSelected = selectedNFT?.tokenId === nft.tokenId;

                return (
                  <div
                    key={nft.tokenId.toString()}
                    onClick={() => onSelectNFT(nft)}
                    className={`rounded-xl overflow-hidden bg-web3-card border transition cursor-pointer ${
                      isSelected
                        ? "border-indigo-500 ring-1 ring-indigo-500/50"
                        : "border-web3-border hover:border-slate-600"
                    }`}
                  >
                    <div className="relative aspect-square w-full bg-slate-950">
                      <Image
                        src={resolveIPFS(nft.tokenURI, lvl)}
                        alt={cfg.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-slate-200">
                        #{nft.tokenId.toString()}
                      </span>
                      <span className={`absolute top-2 right-2 text-[9px] font-semibold px-1.5 py-0.5 rounded border ${cfg.badgeColor}`}>
                        Lv.{lvl}
                      </span>
                    </div>

                    <div className="p-2 text-[11px] flex items-center justify-between bg-web3-surface font-mono">
                      <span className="text-slate-300">{cfg.name}</span>
                      <span className="text-amber-400 font-bold">{nft.combatPower || 40} CP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedNFT && (
        <>
          <TransferModal
            nft={selectedNFT}
            isOpen={isTransferOpen}
            onClose={() => setIsTransferOpen(false)}
            onSuccess={onRefresh}
          />
          <ListModal
            nft={selectedNFT}
            isOpen={isListOpen}
            onClose={() => setIsListOpen(false)}
            onSuccess={onRefresh}
          />
        </>
      )}
    </div>
  );
}
