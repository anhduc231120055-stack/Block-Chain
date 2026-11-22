import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const deployPath = path.join(__dirname, "../deployments/localhost.json");
  const deployment = JSON.parse(fs.readFileSync(deployPath, "utf8"));

  const signers = await ethers.getSigners();
  const merchantBeta = signers[2];  // Owner of Token #9
  const merchantGamma = signers[3]; // For Token #10

  const dynamicNFT = await ethers.getContractAt("DynamicNFT", deployment.dynamicNFT);
  const marketplace = await ethers.getContractAt("NFTMarketplace", deployment.nftMarketplace);
  const vrfCoordinatorMock = await ethers.getContractAt(
    "VRFCoordinatorV2Mock",
    deployment.vrfCoordinator
  );

  const nftAddress = await dynamicNFT.getAddress();
  const marketAddress = await marketplace.getAddress();

  // 1. Finish Token #9 (Currently Level 2 with 200 EXP -> Needs 4 more trains to reach 300 EXP)
  console.log("⚡ Hoàn tất Token #9 lên Level 3 (Chúa Tể Huyền Thoại)...");
  for (let i = 0; i < 4; i++) {
    const tx = await dynamicNFT.connect(merchantBeta).trainNFT(9);
    await tx.wait();
  }

  // Request Level 3 Evolution
  const reqTx = await dynamicNFT.connect(merchantBeta).requestLevelUp(9);
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
    console.log("✅ Token #9 đã thăng cấp thành công lên Level 3 (Legendary Champion)!");
  }

  // Approve & List Token #9
  await (await dynamicNFT.connect(merchantBeta).approve(marketAddress, 9)).wait();
  await (await marketplace.connect(merchantBeta).listItem(nftAddress, 9, ethers.parseEther("0.65"))).wait();
  console.log("🏷️ Đã niêm yết Token #9 lên Chợ với giá: 0.65 ETH!");

  // 2. Create Token #10 (Level 3 - Siêu Cấp Hoàng Kim)
  console.log("\n⚡ Khởi tạo Token #10 và tiến hóa thẳng lên Level 3...");
  const mintTx = await dynamicNFT.connect(merchantGamma).mintNFT(merchantGamma.address);
  const mintRc = await mintTx.wait();
  const tokenId = 10n;

  // Train to 100 EXP -> Level 2
  for (let i = 0; i < 4; i++) {
    await (await dynamicNFT.connect(merchantGamma).trainNFT(tokenId)).wait();
  }
  const req2 = await (await dynamicNFT.connect(merchantGamma).requestLevelUp(tokenId)).wait();
  const ev2 = req2?.logs
    .map((l: any) => { try { return dynamicNFT.interface.parseLog(l); } catch { return null; } })
    .find((p: any) => p?.name === "LevelUpRequested");
  await (await vrfCoordinatorMock.fulfillRandomWords(ev2.args[0], nftAddress)).wait();
  console.log("   -> Token #10 đã lên Level 2.");

  // Train from 0 to 300 EXP -> Level 3 (12 times)
  for (let i = 0; i < 12; i++) {
    await (await dynamicNFT.connect(merchantGamma).trainNFT(tokenId)).wait();
  }
  const req3 = await (await dynamicNFT.connect(merchantGamma).requestLevelUp(tokenId)).wait();
  const ev3 = req3?.logs
    .map((l: any) => { try { return dynamicNFT.interface.parseLog(l); } catch { return null; } })
    .find((p: any) => p?.name === "LevelUpRequested");
  await (await vrfCoordinatorMock.fulfillRandomWords(ev3.args[0], nftAddress)).wait();
  console.log("👑 Token #10 đã thăng cấp thành công lên Level 3 (Hoàng Kim Tối Thượng)!");

  // Approve & List Token #10
  await (await dynamicNFT.connect(merchantGamma).approve(marketAddress, tokenId)).wait();
  await (await marketplace.connect(merchantGamma).listItem(nftAddress, tokenId, ethers.parseEther("1.20"))).wait();
  console.log("🏷️ Đã niêm yết Token #10 lên Chợ với giá: 1.20 ETH!");

  console.log("\n🎉 HOÀN TẤT BỔ SUNG TOÀN DIỆN CẢ 3 CẤP ĐỘ LÊN SÀN MARKETPLACE!");
}

main().catch(console.error);
