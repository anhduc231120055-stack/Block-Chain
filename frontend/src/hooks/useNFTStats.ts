"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { DYNAMIC_NFT_ABI, MARKETPLACE_ABI } from "@/lib/contracts";
import { useNFTContractAddress } from "./useNFTContract";
import { useMarketplaceAddress } from "./useMarketplace";
import { NFTItem, NFTStats, ListingInfo } from "@/types/nft";
import { useMemo } from "react";

export function useTotalSupply() {
  const address = useNFTContractAddress();
  return useReadContract({
    address,
    abi: DYNAMIC_NFT_ABI,
    functionName: "totalSupply",
    query: {
      refetchInterval: 3000,
    },
  });
}

export function useSingleNFT(tokenId: bigint | null) {
  const address = useNFTContractAddress();
  const marketplaceAddress = useMarketplaceAddress();

  const { data: stats, refetch: refetchStats } = useReadContract({
    address,
    abi: DYNAMIC_NFT_ABI,
    functionName: "getNFTStats",
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
      refetchInterval: 2500,
    },
  });

  const { data: owner, refetch: refetchOwner } = useReadContract({
    address,
    abi: DYNAMIC_NFT_ABI,
    functionName: "ownerOf",
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  });

  const { data: uri, refetch: refetchUri } = useReadContract({
    address,
    abi: DYNAMIC_NFT_ABI,
    functionName: "tokenURI",
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
      refetchInterval: 3000,
    },
  });

  const { data: listingData, refetch: refetchListing } = useReadContract({
    address: marketplaceAddress,
    abi: MARKETPLACE_ABI,
    functionName: "getListing",
    args: tokenId && address ? [address, tokenId] : undefined,
    query: {
      enabled: !!tokenId && !!address && !!marketplaceAddress,
      refetchInterval: 2500,
    },
  });

  const listing = listingData as ListingInfo | undefined;

  return {
    stats: stats as NFTStats | undefined,
    owner: owner as `0x${string}` | undefined,
    tokenURI: uri as string | undefined,
    listing,
    refetch: () => {
      refetchStats();
      refetchOwner();
      refetchUri();
      refetchListing();
    },
  };
}

export function useAllNFTs(userAddress?: `0x${string}`) {
  const address = useNFTContractAddress();
  const marketplaceAddress = useMarketplaceAddress();
  const { data: supplyData, refetch: refetchSupply } = useTotalSupply();

  const supply = supplyData ? Number(supplyData) : 0;

  // Build contract calls for all minted tokens (1..supply)
  // Each token gets 4 calls: ownerOf, getNFTStats, tokenURI, getListing
  const contracts = useMemo(() => {
    if (supply === 0) return [];
    const calls = [];
    for (let id = 1; id <= supply; id++) {
      const tokenId = BigInt(id);
      calls.push(
        {
          address,
          abi: DYNAMIC_NFT_ABI,
          functionName: "ownerOf" as const,
          args: [tokenId] as const,
        },
        {
          address,
          abi: DYNAMIC_NFT_ABI,
          functionName: "getNFTStats" as const,
          args: [tokenId] as const,
        },
        {
          address,
          abi: DYNAMIC_NFT_ABI,
          functionName: "tokenURI" as const,
          args: [tokenId] as const,
        },
        {
          address: marketplaceAddress,
          abi: MARKETPLACE_ABI,
          functionName: "getListing" as const,
          args: [address, tokenId] as const,
        }
      );
    }
    return calls;
  }, [address, marketplaceAddress, supply]);

  const { data: batchData, isLoading, refetch: refetchBatch } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
      refetchInterval: 3000,
    },
  });

  const nfts: NFTItem[] = useMemo(() => {
    if (!batchData || supply === 0) return [];
    const items: NFTItem[] = [];

    for (let i = 0; i < supply; i++) {
      const baseIdx = i * 4;
      const ownerRes = batchData[baseIdx];
      const statsRes = batchData[baseIdx + 1];
      const uriRes = batchData[baseIdx + 2];
      const listingRes = batchData[baseIdx + 3];

      if (ownerRes?.status === "success" && statsRes?.status === "success") {
        const tokenId = BigInt(i + 1);
        const owner = ownerRes.result as string;
        const stats = statsRes.result as NFTStats;
        const tokenURI = (uriRes?.status === "success" ? uriRes.result : "") as string;

        let listing: ListingInfo | undefined = undefined;
        if (listingRes?.status === "success") {
          listing = listingRes.result as ListingInfo;
        }

        const combatPower =
          Number(stats.attack) + Number(stats.defense) + Number(stats.speed);

        items.push({
          tokenId,
          owner,
          stats,
          tokenURI,
          listing,
          combatPower,
        });
      }
    }
    return items;
  }, [batchData, supply]);

  const userNFTs = useMemo(() => {
    if (!userAddress) return [];
    return nfts.filter((nft) => nft.owner.toLowerCase() === userAddress.toLowerCase());
  }, [nfts, userAddress]);

  // Listed items in marketplace
  const listedNFTs = useMemo(() => {
    return nfts.filter((nft) => nft.listing && nft.listing.isActive);
  }, [nfts]);

  // Ranked items by Combat Power for Leaderboard
  const rankedNFTs = useMemo(() => {
    return [...nfts].sort((a, b) => (b.combatPower || 0) - (a.combatPower || 0));
  }, [nfts]);

  return {
    allNFTs: nfts,
    userNFTs,
    listedNFTs,
    rankedNFTs,
    totalSupply: supply,
    isLoading,
    refetch: () => {
      refetchSupply();
      refetchBatch();
    },
  };
}
