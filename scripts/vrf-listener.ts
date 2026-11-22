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

  const fulfilledRequests = new Set<string>();

  async function processFulfillment(rawReqId: any, rawTokenId: any) {
    try {
      const requestId = BigInt(rawReqId.toString());
      const tokenId = BigInt(rawTokenId.toString());
      const key = `${requestId}-${tokenId}`;

      if (fulfilledRequests.has(key)) return;

      console.log(`\n📢 Processing VRF Fulfillment:`);
      console.log(`   - Request ID: ${requestId.toString()}`);
      console.log(`   - Token ID:   #${tokenId.toString()}`);

      const stats = await dynamicNFT.nftStats(tokenId);
      if (!stats.isEvolving) {
        fulfilledRequests.add(key);
        console.log(`   - Token #${tokenId.toString()} is already evolved (isEvolving = false). Skipping.`);
        return;
      }

      console.log("⏳ Simulating Chainlink Oracle verification (2 seconds)...");
      await new Promise((res) => setTimeout(res, 2000));

      const tx = await vrfCoordinatorMock.fulfillRandomWords(
        requestId,
        await dynamicNFT.getAddress()
      );
      await tx.wait();
      fulfilledRequests.add(key);

      const newStats = await dynamicNFT.nftStats(tokenId);
      console.log(`✅ VRF Callback fulfilled successfully for Token #${tokenId.toString()}!`);
      console.log(`   -> New Level: ${newStats.level.toString()}`);
      console.log(`   -> New ATK:   ${newStats.attack.toString()} | DEF: ${newStats.defense.toString()} | SPD: ${newStats.speed.toString()}`);
    } catch (err: any) {
      console.error(`❌ Fulfillment error:`, err?.message || err);
    }
  }

  // 1. Initial check for any pending requests
  async function checkPendingRequests() {
    try {
      const filter = dynamicNFT.filters.LevelUpRequested();
      const events = await dynamicNFT.queryFilter(filter);
      for (const event of events) {
        // In ethers v6, event.args contains [requestId, tokenId, requester]
        const reqId = event.args ? event.args[0] : null;
        const tokId = event.args ? event.args[1] : null;
        if (reqId !== null && tokId !== null) {
          await processFulfillment(reqId, tokId);
        }
      }
    } catch (err) {
      console.error("Error checking pending requests:", err);
    }
  }

  // Run initial scan
  await checkPendingRequests();

  // 2. Event listener
  dynamicNFT.on("LevelUpRequested", async (...args) => {
    try {
      let reqId: any;
      let tokId: any;

      const payload = args[args.length - 1];
      if (payload && payload.args) {
        reqId = payload.args[0] ?? payload.args.requestId;
        tokId = payload.args[1] ?? payload.args.tokenId;
      } else {
        reqId = args[0];
        tokId = args[1];
      }

      if (reqId !== undefined && tokId !== undefined) {
        await processFulfillment(reqId, tokId);
      }
    } catch (e) {
      console.error("Listener parse error:", e);
    }
  });

  // 3. Periodic polling every 3 seconds to ensure 100% reliability
  setInterval(async () => {
    await checkPendingRequests();
  }, 3000);

  // Keep script running forever
  await new Promise(() => {});
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
