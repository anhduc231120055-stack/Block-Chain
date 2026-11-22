import { ethers } from "hardhat";

async function main() {
  const nftAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  const marketplaceAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
  const nft = await ethers.getContractAt("DynamicNFT", nftAddress);
  const market = await ethers.getContractAt("NFTMarketplace", marketplaceAddress);

  const totalSupply = await nft.totalSupply();
  console.log("Total Supply:", totalSupply.toString());

  for (let i = 1; i <= Number(totalSupply); i++) {
    const owner = await nft.ownerOf(i);
    const stats = await nft.nftStats(i);
    const listing = await market.getListing(nftAddress, i);
    console.log(`NFT #${i} => Owner: ${owner}, Lvl: ${stats.level}, EXP: ${stats.exp}, isEvolving: ${stats.isEvolving}, Listed: ${listing.isActive} (${ethers.formatEther(listing.price)} ETH)`);
  }
}

main().catch(console.error);
