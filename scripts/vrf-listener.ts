import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const deployPath = path.join(__dirname, "../deployments/localhost.json");
  const deployment = JSON.parse(fs.readFileSync(deployPath, "utf8"));

  const dynamicNFT = await ethers.getContractAt("DynamicNFT", deployment.dynamicNFT);
  const vrfCoordinatorMock = await ethers.getContractAt(
    "VRFCoordinatorV2Mock",
    deployment.vrfCoordinator
  );

  console.log("----------------------------------------------------------");
  console.log("🔮 Chainlink VRF Auto-Fulfill Daemon started on Localhost!");
  console.log("Listening for LevelUpRequested events on contract:", deployment.dynamicNFT);
  console.log("----------------------------------------------------------");

  dynamicNFT.on(
    dynamicNFT.filters.LevelUpRequested(),
    async (requestId, tokenId, requester, event) => {
      console.log(`\n📢 Event detected: LevelUpRequested!`);
      console.log(`   - Request ID: ${requestId.toString()}`);
      console.log(`   - Token ID:   ${tokenId.toString()}`);
      console.log(`   - Requester:  ${requester}`);

      console.log("⏳ Simulating Chainlink Oracle verification (3 seconds delay)...");
      setTimeout(async () => {
        try {
          const tx = await vrfCoordinatorMock.fulfillRandomWords(
            requestId,
            await dynamicNFT.getAddress()
          );
          await tx.wait();
          console.log(`✅ VRF Callback fulfilled successfully for Token #${tokenId.toString()}!`);
        } catch (error: any) {
          console.error(`❌ Fulfillment error:`, error?.message || error);
        }
      }, 3000);
    }
  );

  // Keep script running
  await new Promise(() => {});
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
