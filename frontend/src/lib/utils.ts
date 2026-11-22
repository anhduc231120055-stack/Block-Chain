import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { EXP_LEVEL_2_THRESHOLD, EXP_LEVEL_3_THRESHOLD, IPFS_GATEWAYS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(address?: string, chars = 4): string {
  if (!address) return "";
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function resolveIPFS(uri?: string, levelFallback = 1): string {
  if (!uri) {
    return `/images/level_${levelFallback === 3 ? "3_legendary" : levelFallback === 2 ? "2_elite" : "1_novice"}.jpg`;
  }

  // If already http/https or local path
  if (uri.startsWith("http://") || uri.startsWith("https://") || uri.startsWith("/")) {
    return uri;
  }

  // If ipfs:// protocol
  if (uri.startsWith("ipfs://")) {
    const path = uri.replace("ipfs://", "");
    // Check if filename is in local images
    if (path.includes("level_1") || path.includes("rookie") || path.includes("novice")) {
      return "/images/level_1_novice.jpg";
    }
    if (path.includes("level_2") || path.includes("elite")) {
      return "/images/level_2_elite.jpg";
    }
    if (path.includes("level_3") || path.includes("legendary") || path.includes("champion")) {
      return "/images/level_3_legendary.jpg";
    }
    return `${IPFS_GATEWAYS[0]}${path}`;
  }

  return uri;
}

export function getExpProgress(level: number, exp: number) {
  let threshold = EXP_LEVEL_2_THRESHOLD;
  if (level === 2) threshold = EXP_LEVEL_3_THRESHOLD;
  if (level >= 3) {
    return {
      current: exp,
      max: threshold,
      percent: 100,
      isReady: false,
      isMax: true,
    };
  }

  const percent = Math.min(100, Math.round((exp / threshold) * 100));
  const isReady = exp >= threshold;

  return {
    current: exp,
    max: threshold,
    percent,
    isReady,
    isMax: false,
  };
}
