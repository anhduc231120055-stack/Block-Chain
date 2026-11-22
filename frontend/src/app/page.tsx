"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Header, { NavTab } from "@/components/Header";
import InventoryView from "@/components/InventoryView";
import MarketplaceView from "@/components/MarketplaceView";
import LeaderboardView from "@/components/LeaderboardView";
import ActivityView from "@/components/ActivityView";
import ThesisDocsView from "@/components/ThesisDocsView";
import { useAllNFTs } from "@/hooks/useNFTStats";
import { useBlockchainActivity } from "@/hooks/useBlockchainActivity";
import { NFTItem } from "@/types/nft";

export default function Home() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<NavTab>("inventory");
  const [selectedNFT, setSelectedNFT] = useState<NFTItem | null>(null);

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
    <div className="min-h-screen flex flex-col bg-web3-bg text-slate-100 selection:bg-indigo-600 selection:text-white">
      {/* Sleek Enterprise Web3 Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        userNFTCount={userNFTs.length}
        marketCount={listedNFTs.length}
        currentBlock={currentBlock}
      />

      {/* Main Tabbed Content Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === "inventory" && (
          <InventoryView
            userNFTs={userNFTs}
            allNFTs={allNFTs}
            selectedNFT={selectedNFT}
            onSelectNFT={(nft) => setSelectedNFT(nft)}
            userAddress={address}
            onRefresh={handleGlobalRefresh}
          />
        )}

        {activeTab === "marketplace" && (
          <MarketplaceView
            listedNFTs={listedNFTs}
            userAddress={address}
            onRefresh={handleGlobalRefresh}
          />
        )}

        {activeTab === "leaderboard" && (
          <LeaderboardView
            rankedNFTs={rankedNFTs}
            userAddress={address}
            onSelectNFT={(nft) => {
              setSelectedNFT(nft);
              setActiveTab("inventory");
            }}
          />
        )}

        {activeTab === "activity" && (
          <ActivityView
            activities={activities}
            currentBlock={currentBlock}
            isLoading={isActivityLoading}
            onRefresh={refetchActivity}
          />
        )}

        {activeTab === "thesis" && <ThesisDocsView allNFTs={allNFTs} />}
      </main>

      {/* Modern Academic Web3 Footer */}
      <footer className="border-t border-web3-border bg-web3-surface/60 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Đồ Án Môn Học Công Nghệ Blockchain • Trường Đại Học Điện Lực (EPU)</p>
          <div className="flex items-center space-x-3 text-[11px]">
            <span>Solidity ^0.8.20</span>
            <span>•</span>
            <span>Chainlink VRF v2</span>
            <span>•</span>
            <span>IPFS / Pinata</span>
            <span>•</span>
            <span>Next.js 14</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
