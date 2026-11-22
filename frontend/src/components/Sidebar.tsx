"use client";

import {
  LayoutDashboard,
  Shield,
  ShoppingBag,
  Trophy,
  Activity,
  BookOpen,
  Bell,
  Settings,
  Sparkles,
  ExternalLink,
  Layers,
  Zap,
} from "lucide-react";
import { useChainId } from "wagmi";

export type NavTab = "dashboard" | "inventory" | "marketplace" | "leaderboard" | "activity" | "thesis";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userNFTCount: number;
  marketCount: number;
  currentBlock: number;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  userNFTCount,
  marketCount,
  currentBlock,
}: SidebarProps) {
  const chainId = useChainId();
  const isSepolia = chainId === 11155111;

  const navItems: { id: NavTab; label: string; icon: any; count?: number }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "inventory", label: "Kho Đồ & Rèn Luyện", icon: Shield, count: userNFTCount },
    { id: "marketplace", label: "Chợ dNFT", icon: ShoppingBag, count: marketCount },
    { id: "leaderboard", label: "Bảng Xếp Hạng", icon: Trophy },
    { id: "activity", label: "Sổ Cái On-Chain", icon: Activity },
    { id: "thesis", label: "Thẩm Định VRF", icon: BookOpen },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col justify-between p-4 bg-uifry-sidebar/90 border-r border-uifry-border/70 backdrop-blur-xl min-h-screen">
      {/* Top brand & nav */}
      <div className="space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">WARRIOR</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                dNFT
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Verifiable GameFi</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? "bg-uifry-blue text-white shadow-uifry-blue font-semibold scale-[1.02]"
                    : "text-slate-400 hover:text-slate-100 hover:bg-uifry-pill/80"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-uifry-border text-slate-300"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom section: Help, Notifications, Mini Banner */}
      <div className="space-y-4 pt-4 border-t border-uifry-border/50">
        <div className="space-y-1">
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-slate-400 text-sm hover:bg-uifry-pill/50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <Bell className="w-4 h-4" />
              <span>Thông báo</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>

          <div className="flex items-center justify-between px-4 py-2 text-[11px] font-mono text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isSepolia ? "Sepolia" : "Hardhat Node"}</span>
            </span>
            <span>#{currentBlock > 0 ? currentBlock : "8545"}</span>
          </div>
        </div>

        {/* Mini Promotional / Oracle Status Card with gradient wave */}
        <div className="relative overflow-hidden rounded-3xl p-4 bg-gradient-to-br from-blue-900/60 via-slate-900/90 to-cyan-950/70 border border-blue-500/30 shadow-lg">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-300 text-[10px] font-bold tracking-wider">
                ORACLE
              </span>
              <span className="text-[11px] text-slate-300 font-semibold">Chainlink VRF</span>
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              Xác thực ngẫu nhiên mật mã 256-bit trực tiếp On-Chain.
            </p>
            <button
              onClick={() => onTabChange("thesis")}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-colors flex items-center justify-center space-x-1"
            >
              <span>Xem Thẩm Định</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
