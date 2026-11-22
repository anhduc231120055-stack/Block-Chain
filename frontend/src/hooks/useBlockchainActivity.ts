"use client";

import { useState, useEffect, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { parseEventLogs } from "viem";
import { useNFTContractAddress } from "./useNFTContract";
import { useMarketplaceAddress } from "./useMarketplace";
import { DYNAMIC_NFT_ABI, MARKETPLACE_ABI } from "@/lib/contracts";
import { ActivityEvent } from "@/types/nft";

export function useBlockchainActivity() {
  const publicClient = usePublicClient();
  const nftAddress = useNFTContractAddress();
  const marketplaceAddress = useMarketplaceAddress();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [currentBlock, setCurrentBlock] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchActivities = useCallback(async () => {
    if (!publicClient || !nftAddress) return;
    try {
      const blockNumber = await publicClient.getBlockNumber();
      setCurrentBlock(Number(blockNumber));

      const fromBlock = blockNumber > 2000n ? blockNumber - 2000n : 0n;

      // 1. Fetch raw logs from NFT contract
      const nftLogs = await publicClient.getLogs({
        address: nftAddress,
        fromBlock,
        toBlock: "latest",
      });

      // 2. Fetch raw logs from Marketplace contract if deployed
      let marketLogs: any[] = [];
      if (marketplaceAddress && marketplaceAddress !== "0x0000000000000000000000000000000000000000") {
        marketLogs = await publicClient.getLogs({
          address: marketplaceAddress,
          fromBlock,
          toBlock: "latest",
        });
      }

      // 3. Parse NFT events using viem parseEventLogs with strict: false
      const parsedNftEvents = parseEventLogs({
        abi: DYNAMIC_NFT_ABI,
        logs: nftLogs,
        strict: false,
      });

      // 4. Parse Marketplace events with strict: false
      const parsedMarketEvents = parseEventLogs({
        abi: MARKETPLACE_ABI,
        logs: marketLogs,
        strict: false,
      });

      const parsedActivities: ActivityEvent[] = [];

      // Process NFT events
      for (const event of parsedNftEvents) {
        const { eventName, args, blockNumber: bNum, transactionHash, logIndex } = event as any;
        let type: ActivityEvent["type"] = "MINT";
        let extra = "";

        if (eventName === "NFTMinted") {
          type = "MINT";
          extra = "Đúc Tân Binh Level 1";
        } else if (eventName === "NFTTrained") {
          type = "TRAIN";
          extra = `+25 EXP (${args.currentExp ? args.currentExp.toString() : 0} EXP)`;
        } else if (eventName === "LevelUpRequested") {
          type = "VRF_REQUEST";
          extra = `Yêu cầu VRF #${args.requestId ? args.requestId.toString() : ""}`;
        } else if (eventName === "LevelUpCompleted") {
          type = "LEVEL_UP";
          extra = `Thăng Cấp ${args.newLevel ? args.newLevel.toString() : "2"} (+${args.bonusAtk ? args.bonusAtk.toString() : 0} ATK)`;
        } else if (eventName === "Transfer") {
          if (args.from === "0x0000000000000000000000000000000000000000") {
            continue; // Skip duplicate since NFTMinted handles it
          }
          type = "TRANSFER";
          extra = "Chuyển nhượng quyền sở hữu";
        } else {
          continue;
        }

        parsedActivities.push({
          id: `${transactionHash}-${logIndex}`,
          type,
          tokenId: args.tokenId ? BigInt(args.tokenId.toString()) : 0n,
          from: args.from || args.requester,
          to: args.to || args.owner,
          blockNumber: Number(bNum),
          txHash: transactionHash,
          timestamp: Date.now() - (Number(blockNumber - bNum) * 3000),
          extra,
        });
      }

      // Process Marketplace events
      for (const event of parsedMarketEvents) {
        const { eventName, args, blockNumber: bNum, transactionHash, logIndex } = event as any;
        let type: ActivityEvent["type"] = "LISTED";
        let extra = "";

        if (eventName === "ItemListed") {
          type = "LISTED";
          extra = `Đăng bán ${Number(args.price) / 1e18} ETH`;
        } else if (eventName === "ItemBought") {
          type = "BOUGHT";
          extra = `Khớp lệnh mua ${Number(args.price) / 1e18} ETH`;
        } else if (eventName === "ItemCanceled") {
          type = "LISTED";
          extra = "Hủy niêm yết";
        } else if (eventName === "ListingUpdated") {
          type = "LISTED";
          extra = `Cập nhật giá ${Number(args.newPrice) / 1e18} ETH`;
        } else {
          continue;
        }

        parsedActivities.push({
          id: `${transactionHash}-${logIndex}`,
          type,
          tokenId: args.tokenId ? BigInt(args.tokenId.toString()) : 0n,
          from: args.seller,
          to: args.buyer,
          price: args.price ? BigInt(args.price.toString()) : undefined,
          blockNumber: Number(bNum),
          txHash: transactionHash,
          timestamp: Date.now() - (Number(blockNumber - bNum) * 3000),
          extra,
        });
      }

      // Sort newest first by block number then id
      parsedActivities.sort((a, b) => b.blockNumber - a.blockNumber);
      setActivities(parsedActivities);
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient, nftAddress, marketplaceAddress]);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 3000);
    return () => clearInterval(interval);
  }, [fetchActivities]);

  return {
    activities,
    currentBlock,
    isLoading,
    refetch: fetchActivities,
  };
}
