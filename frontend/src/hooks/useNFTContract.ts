"use client";

import { useChainId, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { DYNAMIC_NFT_ABI, DYNAMIC_NFT_ADDRESSES } from "@/lib/contracts";

export function useNFTContractAddress() {
  const chainId = useChainId();
  return DYNAMIC_NFT_ADDRESSES[chainId] || DYNAMIC_NFT_ADDRESSES[31337];
}

export function useNFTContract() {
  const contractAddress = useNFTContractAddress();
  const { writeContractAsync, isPending, data: hash, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const mintNFT = async (recipient: `0x${string}`) => {
    return await writeContractAsync({
      address: contractAddress,
      abi: DYNAMIC_NFT_ABI,
      functionName: "mintNFT",
      args: [recipient],
    });
  };

  const trainNFT = async (tokenId: bigint) => {
    return await writeContractAsync({
      address: contractAddress,
      abi: DYNAMIC_NFT_ABI,
      functionName: "trainNFT",
      args: [tokenId],
    });
  };

  const requestLevelUp = async (tokenId: bigint) => {
    return await writeContractAsync({
      address: contractAddress,
      abi: DYNAMIC_NFT_ABI,
      functionName: "requestLevelUp",
      args: [tokenId],
    });
  };

  return {
    contractAddress,
    mintNFT,
    trainNFT,
    requestLevelUp,
    txHash: hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
