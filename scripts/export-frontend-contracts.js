const fs = require('fs');
const path = require('path');

const nftArtifactPath = path.join(__dirname, '../artifacts/contracts/DynamicNFT.sol/DynamicNFT.json');
const marketplaceArtifactPath = path.join(__dirname, '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json');
const deployPath = path.join(__dirname, '../deployments/localhost.json');
const outputPath = path.join(__dirname, '../frontend/src/lib/contracts.ts');

const nftArtifact = JSON.parse(fs.readFileSync(nftArtifactPath, 'utf8'));
const marketplaceArtifact = JSON.parse(fs.readFileSync(marketplaceArtifactPath, 'utf8'));

let localNFTAddress = '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9';
let localMarketplaceAddress = '0x0000000000000000000000000000000000000000';

if (fs.existsSync(deployPath)) {
  const localDeploy = JSON.parse(fs.readFileSync(deployPath, 'utf8'));
  localNFTAddress = localDeploy.dynamicNFT || localNFTAddress;
  localMarketplaceAddress = localDeploy.nftMarketplace || localMarketplaceAddress;
}

const fileContent = `// Auto-generated contract configuration
export const DYNAMIC_NFT_ADDRESSES: Record<number, \`0x\${string}\`> = {
  31337: "${localNFTAddress}" as \`0x\${string}\`,
  11155111: (process.env.NEXT_PUBLIC_SEPOLIA_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as \`0x\${string}\`,
};

export const MARKETPLACE_ADDRESSES: Record<number, \`0x\${string}\`> = {
  31337: "${localMarketplaceAddress}" as \`0x\${string}\`,
  11155111: (process.env.NEXT_PUBLIC_SEPOLIA_MARKETPLACE_ADDRESS || "0x0000000000000000000000000000000000000000") as \`0x\${string}\`,
};

export const DYNAMIC_NFT_ABI = ${JSON.stringify(nftArtifact.abi, null, 2)} as const;

export const MARKETPLACE_ABI = ${JSON.stringify(marketplaceArtifact.abi, null, 2)} as const;
`;

fs.writeFileSync(outputPath, fileContent, 'utf8');
console.log('Successfully written frontend/src/lib/contracts.ts with DynamicNFT and NFTMarketplace configurations');
