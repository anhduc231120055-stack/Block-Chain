"use client";

import { useState, useEffect } from "react";
import { usePublicClient } from "wagmi";
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

  const fetchActivities = async () => {
    if (!publicClient || !nftAddress) return;
    try {
      setIsLoading(true);
      const blockNumber = await publicClient.getBlockNumber();
      setCurrentBlock(Number(blockNumber));

      const fromBlock = blockNumber > 1000n ? blockNumber - 1000n : 0n;

      // 1. Get NFT contract events
      const nftEvents = await publicClient.getLogs({
        address: nftAddress,
        fromBlock,
        toBlock: "latest",
      });

      // 2. Get Marketplace events
      let marketplaceEvents: any[] = [];
      if (marketplaceAddress && marketplaceAddress !== "0x0000000000000000000000000000000000000000") {
        marketplaceEvents = await publicClient.getLogs({
          address: marketplaceAddress,
          fromBlock,
          toBlock: "latest",
        });
      }

      const allLogs = [...nftEvents, ...marketplaceEvents];
      const parsedActivities: ActivityEvent[] = [];

      for (const log of allLogs) {
        try {
          // Try parse with DynamicNFT ABI
          let parsed: any = null;
          let isMarketplace = false;

          try {
            parsed = (publicClient as any).parseEventLogs({
              abi: DYNAMIC_NFT_ABI,
              logs: [log],
            })[0];
          } catch {
            // Try parse with Marketplace ABI
            try {
              parsed = (publicClient as any).parseEventLogs({
                abi: MARKETPLACE_ABI,
                logs: [log],
              })[0];
              isMarketplace = true;
            } catch {}
          }

          if (parsed) {
            const eventName = parsed.eventName;
            const args = parsed.args as any;

            let type: ActivityEvent["type"] = "MINT";
            let extra = "";

            if (eventName === "NFTMinted") {
              type = "MINT";
              extra = `Level 1 Tân Binh`;
            } else if (eventName === "NFTTrained") {
              type = "TRAIN";
              extra = `+25 EXP (${args.currentExp} EXP)`;
            } else if (eventName === "LevelUpRequested") {
              type = "VRF_REQUEST";
              extra = `Req ID #${args.requestId.toString()}`;
            } else if (eventName === "LevelUpCompleted") {
              type = "LEVEL_UP";
              extra = `Lên Cấp ${args.newLevel.toString()} (+${args.bonusAtk} ATK)`;
            } else if (eventName === "ItemListed") {
              type = "LISTED";
              extra = `Đăng bán ${Number(args.price) / 1e18} ETH`;
            } else if (eventName === "ItemBought") {
              type = "BOUGHT";
              extra = `Khớp lệnh ${Number(args.price) / 1e18} ETH`;
            } else if (eventName === "Transfer") {
              type = "TRANSFER";
            }

            parsedActivities.push({
              id: `${log.transactionHash}-${log.logIndex}`,
              type,
              tokenId: args.tokenId || 0n,
              from: args.seller || args.from || args.requester,
              to: args.buyer || args.to || args.owner || args.recipient,
              price: args.price,
              blockNumber: Number(log.blockNumber),
              txHash: log.transactionHash,
              timestamp: Date.now() - (Number(blockNumber - log.blockNumber) * 3000),
              extra,
            });
          }
        } catch (e) {
          // ignore unparsed logs
        }
      }

      // Sort newest first
      parsedActivities.sort((a, b) => b.blockNumber - a.blockNumber);
      setActivities(parsedActivities);
    } catch (err) {
      console.error("Error fetching activities:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 4000);
    return () => clearInterval(interval);
  }, [publicClient, nftAddress, marketplaceAddress]);

  return {
    activities,
    currentBlock,
    isLoading,
    refetch: fetchActivities,
  };
}
