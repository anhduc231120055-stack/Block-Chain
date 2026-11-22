import { LevelConfig } from "@/types/nft";

export const APP_NAME = "WARRIOR OF LIGHT";
export const APP_SUBTITLE = "Enterprise Dynamic NFT & Verifiable GameFi Platform";
export const APP_DESCRIPTION = "Enterprise Dynamic NFT & Verifiable GameFi Platform powered by Solidity, Chainlink VRF v2 and IPFS";
export const APP_VERSION = "v2.5.0";

export const EXP_LEVEL_2_THRESHOLD = 100;
export const EXP_LEVEL_3_THRESHOLD = 300;
export const EXP_PER_TRAIN = 25;

export const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
];

export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    level: 1,
    name: "Tân Binh",
    title: "Novice",
    badgeColor: "bg-slate-800/80 text-slate-300 border-slate-700",
    borderColor: "border-slate-800 hover:border-slate-700",
    bgGradient: "from-slate-900/60 to-slate-950/80",
    imageFallback: "/images/level_1_novice.jpg",
    expThreshold: 100,
    description: "Chiến binh sơ cấp trang bị giáp da và gươm gỗ huấn luyện.",
  },
  2: {
    level: 2,
    name: "Hiệp Sĩ Tinh Nhuệ",
    title: "Elite Knight",
    badgeColor: "bg-indigo-950/60 text-indigo-300 border-indigo-700/50",
    borderColor: "border-indigo-900/60 hover:border-indigo-700/70",
    bgGradient: "from-indigo-950/30 to-slate-950/80",
    imageFallback: "/images/level_2_elite.jpg",
    expThreshold: 300,
    description: "Chiến binh tinh nhuệ với giáp thép bạc và khiên hộ mệnh được rèn luyện On-Chain.",
  },
  3: {
    level: 3,
    name: "Chúa Tể Huyền Thoại",
    title: "Legendary",
    badgeColor: "bg-amber-950/60 text-amber-300 border-amber-600/50",
    borderColor: "border-amber-900/60 hover:border-amber-600/70",
    bgGradient: "from-amber-950/30 to-slate-950/80",
    imageFallback: "/images/level_3_legendary.jpg",
    expThreshold: 300,
    description: "Vị tướng lĩnh đạt cảnh giới tối thượng với đôi cánh lửa và chiến giáp hoàng kim.",
  },
};
