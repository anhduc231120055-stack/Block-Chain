"use client";

import { ActivityEvent } from "@/types/nft";
import { shortenAddress } from "@/lib/utils";
import { Activity, ExternalLink, RefreshCw, Layers } from "lucide-react";

interface ActivityViewProps {
  activities: ActivityEvent[];
  currentBlock: number;
  isLoading: boolean;
  onRefresh: () => void;
}

export default function ActivityView({ activities, currentBlock, isLoading, onRefresh }: ActivityViewProps) {
  const getBadge = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "MINT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">MINT</span>;
      case "TRAIN":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">TRAIN</span>;
      case "VRF_REQUEST":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">VRF REQ</span>;
      case "LEVEL_UP":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">LEVEL UP</span>;
      case "LISTED":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">LISTED</span>;
      case "BOUGHT":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">BOUGHT</span>;
      case "TRANSFER":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-300 border border-slate-500/20">TRANSFER</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">EVENT</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Activity Header */}
      <div className="p-5 rounded-2xl bg-web3-card border border-web3-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-sm text-white">Sổ Cái Sự Kiện On-Chain (Blockchain Event Explorer)</h2>
          </div>
          <p className="text-xs text-slate-400">
            Truy vấn thời gian thực toàn bộ lịch sử giao dịch phát ra từ Smart Contract trên khối sổ cái phân tán.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="px-3.5 py-1.5 rounded-xl bg-web3-surface border border-web3-border hover:border-slate-600 text-xs text-slate-300 hover:text-white flex items-center space-x-1.5 transition self-start sm:self-auto font-mono"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Làm Mới</span>
        </button>
      </div>

      {/* Activity Table */}
      <div className="rounded-2xl bg-web3-card border border-web3-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-web3-surface/80 border-b border-web3-border text-[11px] text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Sự Kiện</th>
                <th className="py-3 px-4">Mã Token</th>
                <th className="py-3 px-4">Chi Tiết Nghiệp Vụ</th>
                <th className="py-3 px-4">Khối (Block)</th>
                <th className="py-3 px-4">Mã Băm Giao Dịch (TxHash)</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-web3-border/60">
              {activities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 text-xs">
                    {isLoading ? "Đang đồng bộ sự kiện từ Blockchain..." : "Chưa có sự kiện nào được ghi nhận."}
                  </td>
                </tr>
              ) : (
                activities.map((act) => (
                  <tr key={act.id} className="hover:bg-web3-cardHover/70 transition">
                    <td className="py-3 px-4">{getBadge(act.type)}</td>
                    <td className="py-3 px-4 text-white font-bold">
                      {act.tokenId ? `#${act.tokenId.toString().padStart(3, "0")}` : "—"}
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans text-xs">
                      {act.extra || "Giao dịch thành công"}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <span className="text-indigo-400">#{act.blockNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <span className="text-slate-300 hover:text-white flex items-center space-x-1">
                        <span>{shortenAddress(act.txHash, 6)}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
