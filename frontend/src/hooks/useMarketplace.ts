"use client";

import { useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { MARKETPLACE_ABI, MARKETPLACE_ADDRESSES, DYNAMIC_NFT_ABI } from "@/lib/contracts";
import { parseEther } from "viem";

export function useMarketplaceAddress() {
  const chainId = useChainId();
  return MARKETPLACE_ADDRESSES[chainId] || MARKETPLACE_ADDRESSES[31337];
}

export function useMarketplace() {
  const marketplaceAddress = useMarketplaceAddress();
  const { writeContractAsync, isPending, data: hash, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // 1. Approve NFT for Marketplace
  const approveMarketplace = async (nftAddress: `0x${string}`, tokenId: bigint) => {
    return await writeContractAsync({
      address: nftAddress,
      abi: DYNAMIC_NFT_ABI,
      functionName: "approve",
      args: [marketplaceAddress, tokenId],
    });
  };

  // 2. List Item
  const listItem = async (nftAddress: `0x${string}`, tokenId: bigint, priceEth: string) => {
    const priceWei = parseEther(priceEth);
    return await writeContractAsync({
      address: marketplaceAddress,
      abi: MARKETPLACE_ABI,
      functionName: "listItem",
      args: [nftAddress, tokenId, priceWei],
    });
  };

  // 3. Buy Item
  const buyItem = async (nftAddress: `0x${string}`, tokenId: bigint, priceWei: bigint) => {
    return await writeContractAsync({
      address: marketplaceAddress,
      abi: MARKETPLACE_ABI,
      functionName: "buyItem",
      args: [nftAddress, tokenId],
      value: priceWei,
    });
  };

  // 4. Cancel Listing
  const cancelListing = async (nftAddress: `0x${string}`, tokenId: bigint) => {
    return await writeContractAsync({
      address: marketplaceAddress,
      abi: MARKETPLACE_ABI,
      functionName: "cancelListing",
      args: [nftAddress, tokenId],
    });
  };

  // 5. Update Listing Price
  const updateListing = async (nftAddress: `0x${string}`, tokenId: bigint, newPriceEth: string) => {
    const priceWei = parseEther(newPriceEth);
    return await writeContractAsync({
      address: marketplaceAddress,
      abi: MARKETPLACE_ABI,
      functionName: "updateListing",
      args: [nftAddress, tokenId, priceWei],
    });
  };

  // 6. Direct Transfer (Native ERC721 safeTransferFrom)
  const transferNFT = async (
    nftAddress: `0x${string}`,
    from: `0x${string}`,
    to: `0x${string}`,
    tokenId: bigint
  ) => {
    return await writeContractAsync({
      address: nftAddress,
      abi: DYNAMIC_NFT_ABI,
      functionName: "safeTransferFrom",
      args: [from, to, tokenId],
    });
  };

  return {
    marketplaceAddress,
    approveMarketplace,
    listItem,
    buyItem,
    cancelListing,
    updateListing,
    transferNFT,
    txHash: hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
