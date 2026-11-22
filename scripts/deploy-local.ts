import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer, seller] = await ethers.getSigners();
  console.log("----------------------------------------------------");
  console.log("🚀 Deploying DynamicNFT Ecosystem to Localhost network...");
  console.log("Deployer account:", deployer.address);
  console.log("Seller account:  ", seller.address);

  // 1. Deploy VRFCoordinatorV2Mock
  const BASE_FEE = ethers.parseEther("0.1"); // 0.1 LINK
  const GAS_PRICE_LINK = 1000000000; // 1 gwei LINK

  const VRFCoordinatorMockFactory = await ethers.getContractFactory("VRFCoordinatorV2Mock");
  const vrfCoordinatorMock = await VRFCoordinatorMockFactory.deploy(BASE_FEE, GAS_PRICE_LINK);
  await vrfCoordinatorMock.waitForDeployment();
  const vrfCoordinatorAddress = await vrfCoordinatorMock.getAddress();
  console.log("✅ VRFCoordinatorV2Mock deployed at:", vrfCoordinatorAddress);

  // 2. Create VRF Subscription
  const subTx = await vrfCoordinatorMock.createSubscription();
  const subReceipt = await subTx.wait();
  const subEvent = subReceipt?.logs
    .map((log) => {
      try {
        return vrfCoordinatorMock.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed) => parsed?.name === "SubscriptionCreated");
  const subId = subEvent?.args[0];
  console.log("✅ VRF Subscription created with ID:", subId.toString());

  // Fund Subscription with 10 LINK
  await vrfCoordinatorMock.fundSubscription(subId, ethers.parseEther("10"));
  console.log("✅ Funded subscription with 10 LINK");

  // 3. Deploy DynamicNFT
  const MOCK_KEY_HASH = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
  const URI_LEVEL_1 = "ipfs://bafybeicgq5v4e7znovicewarriorimagehash/level_1_novice.json";
  const URI_LEVEL_2 = "ipfs://bafybeih4j2k9meliteknightimagehash/level_2_elite.json";
  const URI_LEVEL_3 = "ipfs://bafybeia8m2p5qlegendaryimagehash/level_3_legendary.json";

  const DynamicNFTFactory = await ethers.getContractFactory("DynamicNFT");
  const dynamicNFT = await DynamicNFTFactory.deploy(
    vrfCoordinatorAddress,
    subId,
    MOCK_KEY_HASH,
    URI_LEVEL_1,
    URI_LEVEL_2,
    URI_LEVEL_3
  );
  await dynamicNFT.waitForDeployment();
  const dynamicNFTAddress = await dynamicNFT.getAddress();
  console.log("✅ DynamicNFT deployed at:", dynamicNFTAddress);

  // 4. Add DynamicNFT as consumer in VRF Coordinator
  await vrfCoordinatorMock.addConsumer(subId, dynamicNFTAddress);
  console.log("✅ DynamicNFT added as VRF consumer");

  // 5. Deploy NFTMarketplace
  const NFTMarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
  const marketplace = await NFTMarketplaceFactory.deploy(deployer.address);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ NFTMarketplace deployed at:", marketplaceAddress);

  // 6. Seed Sample Warriors & Marketplace Listings
  console.log("\n📦 Seeding initial on-chain data for live demo...");
  // Mint Warrior #1 to seller and list it on marketplace
  const mintTx1 = await dynamicNFT.mintNFT(seller.address);
  await mintTx1.wait();
  await dynamicNFT.connect(seller).trainNFT(1);
  await dynamicNFT.connect(seller).trainNFT(1);
  console.log("   - Minted Token #1 to seller (trained to 50 EXP)");

  // Approve and list on marketplace
  await dynamicNFT.connect(seller).approve(marketplaceAddress, 1);
  await marketplace.connect(seller).listItem(dynamicNFTAddress, 1, ethers.parseEther("0.05"));
  console.log("   - Listed Token #1 on Marketplace for 0.05 ETH");

  // Mint Warrior #2 for seller (untrained Novice)
  const mintTx2 = await dynamicNFT.mintNFT(seller.address);
  await mintTx2.wait();
  await dynamicNFT.connect(seller).approve(marketplaceAddress, 2);
  await marketplace.connect(seller).listItem(dynamicNFTAddress, 2, ethers.parseEther("0.03"));
  console.log("   - Listed Token #2 on Marketplace for 0.03 ETH");

  // 7. Save addresses for Frontend
  const deploymentData = {
    network: "localhost",
    chainId: 31337,
    dynamicNFT: dynamicNFTAddress,
    nftMarketplace: marketplaceAddress,
    vrfCoordinator: vrfCoordinatorAddress,
    subId: subId.toString(),
    keyHash: MOCK_KEY_HASH,
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
    path.join(outputDir, "localhost.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log("\n📁 Deployment info saved to deployments/localhost.json");
  console.log("----------------------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
