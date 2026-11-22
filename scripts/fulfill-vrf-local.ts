import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const deployPath = path.join(__dirname, "../deployments/localhost.json");
  const deployment = JSON.parse(fs.readFileSync(deployPath, "utf8"));

  const [deployer] = await ethers.getSigners();
  console.log("Using deployer:", deployer.address);

  const dynamicNFT = await ethers.getContractAt("DynamicNFT", deployment.dynamicNFT);
  const vrfCoordinatorMock = await ethers.getContractAt(
    "VRFCoordinatorV2Mock",
    deployment.vrfCoordinator
  );

  console.log("Checking token #1 stats...");
  const stats = await dynamicNFT.getNFTStats(1);
  console.log("Level:", stats.level.toString());
  console.log("EXP:", stats.exp.toString());
  console.log("isEvolving:", stats.isEvolving);

  // If token is evolving, fulfill the pending request
  if (stats.isEvolving) {
    console.log("Token is evolving! Checking events for requestId...");
    const filter = dynamicNFT.filters.LevelUpRequested();
    const events = await dynamicNFT.queryFilter(filter);
    console.log(`Found ${events.length} LevelUpRequested event(s).`);

    for (const event of events) {
      const requestId = event.args[0];
      const tokenId = event.args[1];
      console.log(`Fulfilling requestId ${requestId.toString()} for tokenId ${tokenId.toString()}...`);
      try {
        const tx = await vrfCoordinatorMock.fulfillRandomWords(
          requestId,
          await dynamicNFT.getAddress()
        );
        await tx.wait();
        console.log(`✅ Successfully fulfilled requestId ${requestId.toString()}!`);
      } catch (err: any) {
        console.log(`Already fulfilled or error:`, err?.message || err);
      }
    }

    const updatedStats = await dynamicNFT.getNFTStats(1);
    console.log("\n--- UPDATED STATS ---");
    console.log("New Level:", updatedStats.level.toString());
    console.log("New ATK:", updatedStats.attack.toString());
    console.log("New DEF:", updatedStats.defense.toString());
    console.log("New SPD:", updatedStats.speed.toString());
    console.log("isEvolving:", updatedStats.isEvolving);
    console.log("New tokenURI:", await dynamicNFT.tokenURI(1));
  } else {
    console.log("Token is not currently evolving.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
