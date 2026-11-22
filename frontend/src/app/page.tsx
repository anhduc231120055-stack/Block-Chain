"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Sidebar, { NavTab } from "@/components/Sidebar";
import ProfilePanel from "@/components/ProfilePanel";
import DashboardView from "@/components/DashboardView";
import InventoryView from "@/components/InventoryView";
import MarketplaceView from "@/components/MarketplaceView";
import LeaderboardView from "@/components/LeaderboardView";
import ActivityView from "@/components/ActivityView";
import ThesisDocsView from "@/components/ThesisDocsView";
import TransferModal from "@/components/TransferModal";
import { useAllNFTs } from "@/hooks/useNFTStats";
import { useBlockchainActivity } from "@/hooks/useBlockchainActivity";
import { NFTItem } from "@/types/nft";

export default function Home() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  const {
    allNFTs,
    userNFTs,
    listedNFTs,
    rankedNFTs,
    totalSupply,
    isLoading: isStatsLoading,
    refetch: refetchNFTs,
  } = useAllNFTs(address);

  const {
    activities,
    currentBlock,
    isLoading: isActivityLoading,
    refetch: refetchActivity,
  } = useBlockchainActivity();

  // Auto-select user's first NFT, or first global NFT if user owns none
  useEffect(() => {
    if (!selectedNFT) {
      if (userNFTs.length > 0) {
        setSelectedNFT(userNFTs[0]);
      } else if (allNFTs.length > 0) {
        setSelectedNFT(allNFTs[0]);
      }
    } else {
      const updated = allNFTs.find((n) => n.tokenId === selectedNFT.tokenId);
      if (updated) {
        setSelectedNFT(updated);
      }
    }
  }, [userNFTs, allNFTs]);

  const handleGlobalRefresh = () => {
    refetchNFTs();
    refetchActivity();
  };

  return (
    <div className="min-h-screen bg-uifry-bg text-slate-100 flex overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* 1. Left Column: Floating Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        userNFTCount={userNFTs.length}
        marketCount={listedNFTs.length}
        currentBlock={currentBlock}
      />

      {/* 2. Middle Column: Main Content Workspace */}
      <main className="flex-1 flex flex-col min-w-0 p-5 md:p-8 overflow-y-auto max-h-screen">
        {activeTab === "dashboard" && (
          <DashboardView
            userAddress={address}
            userNFTs={userNFTs}
            allNFTs={allNFTs}
            activities={activities}
            selectedNFT={selectedNFT}
            onSelectNFT={(nft) => setSelectedNFT(nft)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-uifry-border">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Kho Đồ & Tiến Hóa Chiến Binh</h1>
                <p className="text-xs text-slate-400">Rèn luyện chỉ số on-chain và kích hoạt thăng cấp ngẫu nhiên qua Chainlink VRF</p>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-uifry-pill hover:bg-uifry-border text-slate-300 transition"
              >
                ← Quay lại Dashboard
              </button>
            </div>
            <InventoryView
              userNFTs={userNFTs}
              allNFTs={allNFTs}
              selectedNFT={selectedNFT}
              onSelectNFT={(nft) => setSelectedNFT(nft)}
              userAddress={address}
              onRefresh={handleGlobalRefresh}
            />
          </div>
        )}

        {activeTab === "marketplace" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-uifry-border">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Chợ Giao Dịch dNFT</h1>
                <p className="text-xs text-slate-400">Sàn giao dịch phi tập trung Non-custodial bảo mật bằng ReentrancyGuard</p>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-uifry-pill hover:bg-uifry-border text-slate-300 transition"
              >
                ← Quay lại Dashboard
              </button>
            </div>
            <MarketplaceView
              listedNFTs={listedNFTs}
              userAddress={address}
              onRefresh={handleGlobalRefresh}
            />
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-uifry-border">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Bảng Xếp Hạng Chiến Lực</h1>
                <p className="text-xs text-slate-400">Vinh danh các chiến binh có điểm Combat Power (CP) cao nhất trên chuỗi khối</p>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-uifry-pill hover:bg-uifry-border text-slate-300 transition"
              >
                ← Quay lại Dashboard
              </button>
            </div>
            <LeaderboardView
              rankedNFTs={rankedNFTs}
              userAddress={address}
              onSelectNFT={(nft) => {
                setSelectedNFT(nft);
                setActiveTab("inventory");
              }}
            />
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-uifry-border">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Sổ Cái On-Chain (Blockchain Explorer)</h1>
                <p className="text-xs text-slate-400">Truy vấn trực tiếp các Event Logs phát ra từ Smart Contracts</p>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-uifry-pill hover:bg-uifry-border text-slate-300 transition"
              >
                ← Quay lại Dashboard
              </button>
            </div>
            <ActivityView
              activities={activities}
              currentBlock={currentBlock}
              isLoading={isActivityLoading}
              onRefresh={refetchActivity}
            />
          </div>
        )}

        {activeTab === "thesis" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-uifry-border">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Thẩm Định Bằng Chứng VRF & Đồ Án</h1>
                <p className="text-xs text-slate-400">Kiểm tra tính ngẫu nhiên mật mã 256-bit và hồ sơ kiến trúc đồ án tốt nghiệp</p>
              </div>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-uifry-pill hover:bg-uifry-border text-slate-300 transition"
              >
                ← Quay lại Dashboard
              </button>
            </div>
            <ThesisDocsView allNFTs={allNFTs} />
          </div>
        )}
      </main>

      {/* 3. Right Column: Profile & Control Center */}
      <ProfilePanel
        userAddress={address}
        userNFTs={userNFTs}
        allNFTs={allNFTs}
        onOpenTransfer={() => setIsTransferOpen(true)}
        onNavigateToLeaderboard={() => setActiveTab("leaderboard")}
        onRefresh={handleGlobalRefresh}
      />

      {/* Global Transfer Modal */}
      {selectedNFT && (
        <TransferModal
          nft={selectedNFT}
          isOpen={isTransferOpen}
          onClose={() => setIsTransferOpen(false)}
          onSuccess={() => {
            setIsTransferOpen(false);
            handleGlobalRefresh();
          }}
        />
      )}
    </div>
  );
}
