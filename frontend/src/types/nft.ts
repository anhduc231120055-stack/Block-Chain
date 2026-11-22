export interface NFTStats {
  level: bigint;
  exp: bigint;
  attack: bigint;
  defense: bigint;
  speed: bigint;
  isEvolving: boolean;
}

export interface NFTMetadataAttribute {
  trait_type: string;
  value: string | number;
  display_type?: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: NFTMetadataAttribute[];
}

export interface ListingInfo {
  seller: string;
  price: bigint;
  isActive: boolean;
}

export interface NFTItem {
  tokenId: bigint;
  owner: string;
  stats: NFTStats;
  tokenURI: string;
  metadata?: NFTMetadata;
  listing?: ListingInfo;
  combatPower?: number;
}

export interface LevelConfig {
  level: number;
  name: string;
  title: string;
  badgeColor: string;
  borderColor: string;
  bgGradient: string;
  imageFallback: string;
  expThreshold: number;
  description: string;
}

export interface ActivityEvent {
  id: string;
  type: "MINT" | "TRAIN" | "VRF_REQUEST" | "LEVEL_UP" | "LISTED" | "BOUGHT" | "TRANSFER";
  tokenId: bigint;
  from?: string;
  to?: string;
  price?: bigint;
  blockNumber: number;
  txHash: string;
  timestamp: number;
  extra?: string;
}
