import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const deployPath = path.join(__dirname, "../deployments/localhost.json");
  const deployment = JSON.parse(fs.readFileSync(deployPath, "utf8"));

  const signers = await ethers.getSigners();
  const merchantBeta = signers[2];  // Owner of Token #7
  const merchantGamma = signers[3]; // For Token #8

  const dynamicNFT = await ethers.getContractAt("DynamicNFT", deployment.dynamicNFT);
  const marketplace = await ethers.getContractAt("NFTMarketplace", deployment.nftMarketplace);
  const vrfCoordinatorMock = await ethers.getContractAt(
    "VRFCoordinatorV2Mock",
    deployment.vrfCoordinator
  );

  const nftAddress = await dynamicNFT.getAddress();
  const marketAddress = await marketplace.getAddress();

  // 1. Finish Token #7 (Currently Level 2 with 200 EXP -> Needs 4 more trains to reach 300 EXP)
  console.log("⚡ Hoàn tất Token #7 lên Level 3 (Chúa Tể Huyền Thoại)...");
  for (let i = 0; i < 4; i++) {
    const tx = await dynamicNFT.connect(merchantBeta).trainNFT(7);
    await tx.wait();
  }

  const reqTx = await dynamicNFT.connect(merchantBeta).requestLevelUp(7);
  const reqRc = await reqTx.wait();
  const event = reqRc?.logs
    .map((l: any) => {
      try {
        return dynamicNFT.interface.parseLog(l);
      } catch {
        return null;
      }
    })
    .find((p: any) => p?.name === "LevelUpRequested");

  if (event) {
    const reqId = event.args[0];
    const fulTx = await vrfCoordinatorMock.fulfillRandomWords(reqId, nftAddress);
    await fulTx.wait();
    console.log("✅ Token #7 đã thăng cấp thành công lên Level 3 (Legendary Champion)!");
  }

  await (await dynamicNFT.connect(merchantBeta).approve(marketAddress, 7)).wait();
  await (await marketplace.connect(merchantBeta).listItem(nftAddress, 7, ethers.parseEther("0.65"))).wait();
  console.log("🏷️ Đã niêm yết Token #7 lên Chợ với giá: 0.65 ETH!");

  // 2. Create Token #8 (Level 3 - Hoàng Kim Tối Thượng)
  console.log("\n⚡ Khởi tạo Token #8 và tiến hóa thẳng lên Level 3...");
  const mintTx = await dynamicNFT.connect(merchantGamma).mintNFT(merchantGamma.address);
  await mintTx.wait();
  const tokenId = 8n;

  // Level 1 -> Level 2 (100 EXP)
  for (let i = 0; i < 4; i++) {
    await (await dynamicNFT.connect(merchantGamma).trainNFT(tokenId)).wait();
  }
  const req2 = await (await dynamicNFT.connect(merchantGamma).requestLevelUp(tokenId)).wait();
  const ev2 = req2?.logs
    .map((l: any) => { try { return dynamicNFT.interface.parseLog(l); } catch { return null; } })
    .find((p: any) => p?.name === "LevelUpRequested");
  await (await vrfCoordinatorMock.fulfillRandomWords(ev2.args[0], nftAddress)).wait();
  console.log("   -> Token #8 đã lên Level 2.");

  // Level 2 -> Level 3 (300 EXP, 12 trains)
  for (let i = 0; i < 12; i++) {
    await (await dynamicNFT.connect(merchantGamma).trainNFT(tokenId)).wait();
  }
  const req3 = await (await dynamicNFT.connect(merchantGamma).requestLevelUp(tokenId)).wait();
  const ev3 = req3?.logs
    .map((l: any) => { try { return dynamicNFT.interface.parseLog(l); } catch { return null; } })
    .find((p: any) => p?.name === "LevelUpRequested");
  await (await vrfCoordinatorMock.fulfillRandomWords(ev3.args[0], nftAddress)).wait();
  console.log("👑 Token #8 đã thăng cấp thành công lên Level 3 (Hoàng Kim Tối Thượng)!");

  await (await dynamicNFT.connect(merchantGamma).approve(marketAddress, tokenId)).wait();
  await (await marketplace.connect(merchantGamma).listItem(nftAddress, tokenId, ethers.parseEther("1.20"))).wait();
  console.log("🏷️ Đã niêm yết Token #8 lên Chợ với giá: 1.20 ETH!");

  console.log("\n🎉 HOÀN TẤT BỔ SUNG CẢ 3 CẤP ĐỘ LÊN SÀN MARKETPLACE!");
}

main().catch(console.error);
