"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { NFTItem } from "@/types/nft";
import { LEVEL_CONFIGS } from "@/lib/constants";
import { resolveIPFS, shortenAddress } from "@/lib/utils";
import { useMarketplace, useMarketplaceAddress } from "@/hooks/useMarketplace";
import { useNFTContractAddress } from "@/hooks/useNFTContract";
import {
  ShoppingBag,
  Tag,
  ArrowUpDown,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  ExternalLink,
  Shield,
  Coins,
} from "lucide-react";
import confetti from "canvas-confetti";

interface MarketplaceViewProps {
  listedNFTs: NFTItem[];
  userAddress?: string;
  onRefresh: () => void;
}

export default function MarketplaceView({ listedNFTs, userAddress, onRefresh }: MarketplaceViewProps) {
  const [filterLevel, setFilterLevel] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "power-desc">("price-asc");
  const [actionError, setActionError] = useState<string | null>(null);

  const { buyItem, cancelListing, isPending, isConfirming } = useMarketplace();
  const nftAddress = useNFTContractAddress();
  const isLoading = isPending || isConfirming;

  // Handle Buy Item
  const handleBuy = async (nft: NFTItem) => {
    if (!nft.listing) return;
    try {
      setActionError(null);
      await buyItem(nftAddress, nft.tokenId, nft.listing.price);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setActionError(err?.shortMessage || err?.message || "Mua NFT thất bại");
    }
  };

  // Handle Cancel Listing
  const handleCancel = async (nft: NFTItem) => {
    try {
      setActionError(null);
      await cancelListing(nftAddress, nft.tokenId);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      setActionError(err?.shortMessage || err?.message || "Hủy niêm yết thất bại");
    }
  };

  // Metrics
  const floorPrice = useMemo(() => {
    if (listedNFTs.length === 0) return 0;
    const prices = listedNFTs.map((n) => Number(n.listing?.price || 0) / 1e18);
    return Math.min(...prices);
  }, [listedNFTs]);

  // Filtering and sorting
  const displayedItems = useMemo(() => {
    let result = listedNFTs.filter((nft) =>
      filterLevel === 0 ? true : Number(nft.stats.level) === filterLevel
    );

    if (sortBy === "price-asc") {
      result.sort((a, b) => Number(a.listing?.price || 0) - Number(b.listing?.price || 0));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => Number(b.listing?.price || 0) - Number(a.listing?.price || 0));
    } else if (sortBy === "power-desc") {
      result.sort((a, b) => (b.combatPower || 0) - (a.combatPower || 0));
    }

    return result;
  }, [listedNFTs, filterLevel, sortBy]);

  return (
    <div className="space-y-6">
      {/* Marketplace Header Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-web3-card border border-web3-border">
          <span className="text-[11px] text-slate-400 block mb-0.5">dNFT Đang Bán</span>
          <span className="font-mono font-bold text-xl text-white">{listedNFTs.length}</span>
        </div>

        <div className="p-4 rounded-xl bg-web3-card border border-web3-border">
          <span className="text-[11px] text-slate-400 block mb-0.5">Giá Sàn (Floor Price)</span>
          <span className="font-mono font-bold text-xl text-amber-400">
            {floorPrice > 0 ? `${floorPrice} ETH` : "—"}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-web3-card border border-web3-border">
          <span className="text-[11px] text-slate-400 block mb-0.5">Khớp Lệnh Chuẩn</span>
          <span className="font-mono font-bold text-xl text-emerald-400">P2P Escrow</span>
        </div>

        <div className="p-4 rounded-xl bg-web3-card border border-web3-border">
          <span className="text-[11px] text-slate-400 block mb-0.5">Phí Sàn Hệ Thống</span>
          <span className="font-mono font-bold text-xl text-indigo-400">1.0%</span>
        </div>
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter & Sort Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-web3-card border border-web3-border">
        {/* Level filter tabs */}
        <div className="flex items-center space-x-1 text-xs">
          {[
            { label: "Tất cả", lvl: 0 },
            { label: "Cấp 1 (Tân Binh)", lvl: 1 },
            { label: "Cấp 2 (Hiệp Sĩ)", lvl: 2 },
            { label: "Cấp 3 (Huyền Thoại)", lvl: 3 },
          ].map((f) => (
            <button
              key={f.lvl}
              onClick={() => setFilterLevel(f.lvl)}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                filterLevel === f.lvl
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "bg-web3-surface text-slate-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center space-x-2 text-xs">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-web3-surface border border-web3-border text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="power-desc">Lực Chiến: Cao nhất</option>
          </select>
        </div>
      </div>

      {/* Marketplace Grid */}
      {displayedItems.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-web3-card/50 border border-dashed border-web3-border text-xs text-slate-400 space-y-3">
          <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="font-semibold text-slate-300">Không có dNFT nào đang được niêm yết trong danh mục này.</p>
          <p className="text-[11px] text-slate-500">
            Bạn có thể chuyển sang tab <strong>"Kho Đồ & Tiến Hóa"</strong> để đăng bán một chiến binh của mình!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedItems.map((nft) => {
            const lvl = Number(nft.stats.level);
            const cfg = LEVEL_CONFIGS[lvl] || LEVEL_CONFIGS[1];
            const priceEth = Number(nft.listing?.price || 0) / 1e18;
            const isSeller = userAddress && nft.listing?.seller.toLowerCase() === userAddress.toLowerCase();

            return (
              <div
                key={nft.tokenId.toString()}
                className="rounded-2xl overflow-hidden bg-web3-card border border-web3-border hover:border-slate-700 transition flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] w-full bg-slate-950">
                  <Image
                    src={resolveIPFS(nft.tokenURI, lvl)}
                    alt={cfg.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/75 text-slate-200 border border-slate-700">
                    #{nft.tokenId.toString().padStart(3, "0")}
                  </span>
                  <span className={`absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${cfg.badgeColor}`}>
                    {cfg.title} (Lv.{lvl})
                  </span>
                </div>

                {/* Details */}
                <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <h4 className="font-bold text-white">{cfg.name}</h4>
                      <span className="font-mono text-amber-400 font-extrabold text-xs">
                        {nft.combatPower || 40} CP
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
                      <span>Người bán:</span>
                      <span className="text-slate-300">
                        {isSeller ? "Ví của bạn" : shortenAddress(nft.listing?.seller, 3)}
                      </span>
                    </div>
                  </div>

                  {/* Pricing & Buy Button */}
                  <div className="pt-2 border-t border-web3-border/80 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Giá Bán</span>
                      <span className="font-mono font-bold text-sm text-white flex items-center space-x-1">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>{priceEth} ETH</span>
                      </span>
                    </div>

                    {isSeller ? (
                      <button
                        onClick={() => handleCancel(nft)}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 hover:bg-rose-900/50 text-xs font-semibold transition"
                      >
                        Hủy Bán
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuy(nft)}
                        disabled={!userAddress || isLoading}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-xs font-semibold text-white transition flex items-center space-x-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Mua Ngay</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
