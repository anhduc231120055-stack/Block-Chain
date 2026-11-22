import { ethers, run } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("----------------------------------------------------");
  console.log("🚀 Deploying DynamicNFT to Ethereum Sepolia Testnet...");
  console.log("Deployer account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // Sepolia Chainlink VRF v2 parameters
  const VRF_COORDINATOR =
    process.env.VRF_COORDINATOR || "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625";
  const KEY_HASH =
    process.env.KEY_HASH ||
    "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
  const VRF_SUBSCRIPTION_ID = BigInt(process.env.VRF_SUBSCRIPTION_ID || "0");

  const URI_LEVEL_1 =
    process.env.URI_LEVEL_1 ||
    "ipfs://bafybeicgq5v4e7znovicewarriorimagehash/level_1_novice.json";
  const URI_LEVEL_2 =
    process.env.URI_LEVEL_2 ||
    "ipfs://bafybeih4j2k9meliteknightimagehash/level_2_elite.json";
  const URI_LEVEL_3 =
    process.env.URI_LEVEL_3 ||
    "ipfs://bafybeia8m2p5qlegendaryimagehash/level_3_legendary.json";

  console.log("VRF Coordinator:", VRF_COORDINATOR);
  console.log("Key Hash:", KEY_HASH);
  console.log("Subscription ID:", VRF_SUBSCRIPTION_ID.toString());

  // Deploy DynamicNFT contract
  const DynamicNFTFactory = await ethers.getContractFactory("DynamicNFT");
  const dynamicNFT = await DynamicNFTFactory.deploy(
    VRF_COORDINATOR,
    VRF_SUBSCRIPTION_ID,
    KEY_HASH,
    URI_LEVEL_1,
    URI_LEVEL_2,
    URI_LEVEL_3
  );

  console.log("⏳ Awaiting deployment confirmation...");
  await dynamicNFT.waitForDeployment();
  const dynamicNFTAddress = await dynamicNFT.getAddress();
  console.log("✅ DynamicNFT deployed at:", dynamicNFTAddress);

  // Save deployment info
  const deploymentData = {
    network: "sepolia",
    chainId: 11155111,
    dynamicNFT: dynamicNFTAddress,
    vrfCoordinator: VRF_COORDINATOR,
    subId: VRF_SUBSCRIPTION_ID.toString(),
    keyHash: KEY_HASH,
    uris: {
      1: URI_LEVEL_1,
      2: URI_LEVEL_2,
      3: URI_LEVEL_3,
    },
  };

  const outputDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(outputDir, "sepolia.json"),
    JSON.stringify(deploymentData, null, 2)
  );
  console.log("📁 Deployment info saved to deployments/sepolia.json");

  console.log("\n⚠️ IMPORTANT NEXT STEPS FOR SEPOLIA:");
  console.log("1. Add this contract address as a consumer to your Chainlink VRF Subscription at https://vrf.chain.link");
  console.log(`   Consumer Address: ${dynamicNFTAddress}`);
  console.log("2. Verify contract on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${dynamicNFTAddress} "${VRF_COORDINATOR}" "${VRF_SUBSCRIPTION_ID}" "${KEY_HASH}" "${URI_LEVEL_1}" "${URI_LEVEL_2}" "${URI_LEVEL_3}"`);
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
