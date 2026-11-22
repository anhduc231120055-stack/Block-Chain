"use client";

import { useState } from "react";
import { NFTItem } from "@/types/nft";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useNFTContractAddress } from "@/hooks/useNFTContract";
import { Send, X, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

interface TransferModalProps {
  nft: NFTItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransferModal({ nft, isOpen, onClose, onSuccess }: TransferModalProps) {
  const [recipient, setRecipient] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { transferNFT, isPending, isConfirming } = useMarketplace();
  const nftAddress = useNFTContractAddress();

  if (!isOpen) return null;

  const isLoading = isPending || isConfirming;

  const handleTransfer = async () => {
    if (!recipient.startsWith("0x") || recipient.length !== 42) {
      setErrorMsg("Địa chỉ ví không hợp lệ (Phải bắt đầu bằng 0x và đủ 42 ký tự).");
      return;
    }

    try {
      setErrorMsg(null);
      await transferNFT(
        nftAddress,
        nft.owner as `0x${string}`,
        recipient as `0x${string}`,
        nft.tokenId
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.shortMessage || err?.message || "Giao dịch chuyển nhượng thất bại");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md p-6 bg-web3-card rounded-2xl border border-web3-border shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-web3-border">
          <div className="flex items-center space-x-2">
            <Send className="w-4 h-4 text-indigo-400" />
            <h3 className="font-bold text-sm text-white">Chuyển Nhượng NFT #{nft.tokenId.toString()}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="text-xs text-slate-300 space-y-2">
          <p>
            Bạn đang chuyển quyền sở hữu chiến binh <strong>#{nft.tokenId.toString()}</strong> (Cấp độ {nft.stats.level.toString()}) sang một địa chỉ ví khác qua hàm <code className="font-mono text-indigo-300">safeTransferFrom</code>.
          </p>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1 font-medium">Địa chỉ ví người nhận (0x...):</label>
            <input
              type="text"
              placeholder="0x1234...5678"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value.trim())}
              className="w-full px-3 py-2 rounded-xl bg-web3-surface border border-web3-border text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="flex items-start space-x-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center space-x-2 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-web3-surface border border-web3-border text-xs text-slate-300 hover:text-white transition"
          >
            Hủy
          </button>

          <button
            onClick={handleTransfer}
            disabled={isLoading || !recipient}
            className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 font-semibold text-xs text-white transition flex items-center justify-center space-x-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Xác Nhận Chuyển</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
