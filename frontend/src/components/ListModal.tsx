"use client";

import { useState } from "react";
import { NFTItem } from "@/types/nft";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useNFTContractAddress } from "@/hooks/useNFTContract";
import { ShoppingBag, X, AlertCircle, Loader2, Tag, CheckCircle2 } from "lucide-react";

interface ListModalProps {
  nft: NFTItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ListModal({ nft, isOpen, onClose, onSuccess }: ListModalProps) {
  const [priceEth, setPriceEth] = useState("0.05");
  const [step, setStep] = useState<"approve" | "list">("approve");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { approveMarketplace, listItem, isPending, isConfirming } = useMarketplace();
  const nftAddress = useNFTContractAddress();

  if (!isOpen) return null;

  const isLoading = isPending || isConfirming;

  const handleApprove = async () => {
    try {
      setErrorMsg(null);
      await approveMarketplace(nftAddress, nft.tokenId);
      setStep("list");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.shortMessage || err?.message || "Cấp quyền cho sàn thất bại");
    }
  };

  const handleList = async () => {
    const numPrice = parseFloat(priceEth);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMsg("Giá bán phải lớn hơn 0 ETH.");
      return;
    }

    try {
      setErrorMsg(null);
      await listItem(nftAddress, nft.tokenId, priceEth);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.shortMessage || err?.message || "Đăng bán thất bại");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 bg-web3-card rounded-2xl border border-web3-border shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-web3-border">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">Niêm Yết Bán NFT #{nft.tokenId.toString()}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pricing input */}
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Đăng bán chiến binh <strong>#{nft.tokenId.toString()}</strong> (Cấp {nft.stats.level.toString()} • Lực chiến: {nft.combatPower || 40}) lên Sàn giao dịch phi tập trung.
          </p>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-medium">Giá bán (ETH):</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.001"
                value={priceEth}
                onChange={(e) => setPriceEth(e.target.value)}
                className="w-full px-3 py-2 pr-12 rounded-xl bg-web3-surface border border-web3-border text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="absolute right-3 top-2 text-xs text-slate-400 font-bold">ETH</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Phí sàn: 1% khi giao dịch hoàn tất.</p>
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-start space-x-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action button: 2-step process */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-web3-surface border border-web3-border text-xs text-slate-300 hover:text-white transition"
          >
            Hủy
          </button>

          {step === "approve" ? (
            <button
              onClick={handleApprove}
              disabled={isLoading}
              className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 font-semibold text-xs text-white transition flex items-center justify-center space-x-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang cấp quyền...</span>
                </>
              ) : (
                <span>1. Cấp Quyền Cho Sàn</span>
              )}
            </button>
          ) : (
            <button
              onClick={handleList}
              disabled={isLoading}
              className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 font-semibold text-xs text-white transition flex items-center justify-center space-x-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang niêm yết...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>2. Xác Nhận Niêm Yết</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
