import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("==========================================================");
  console.log("🛒 DANG KHOI TAO THEM NHIEU HANG MOI CHO SAN MARKETPLACE...");
  console.log("==========================================================");

  const deployPath = path.join(__dirname, "../deployments/localhost.json");
  const deployment = JSON.parse(fs.readFileSync(deployPath, "utf8"));

  const signers = await ethers.getSigners();
  const deployer = signers[0];
  const merchantAlpha = signers[1];
  const merchantBeta = signers[2];
  const merchantGamma = signers[3];

  const dynamicNFT = await ethers.getContractAt("DynamicNFT", deployment.dynamicNFT);
  const marketplace = await ethers.getContractAt("NFTMarketplace", deployment.nftMarketplace);
  const vrfCoordinatorMock = await ethers.getContractAt(
    "VRFCoordinatorV2Mock",
    deployment.vrfCoordinator
  );

  const nftAddress = await dynamicNFT.getAddress();
  const marketAddress = await marketplace.getAddress();

  // Helper to evolve token
  async function evolveToken(signer: any, tokenId: bigint, targetLevel: number) {
    if (targetLevel >= 2) {
      console.log(`   -> Đang rèn luyện Token #${tokenId} lên 100 EXP (Cấp 2)...`);
      for (let i = 0; i < 4; i++) {
        const trainTx = await dynamicNFT.connect(signer).trainNFT(tokenId);
        await trainTx.wait();
      }
      const reqTx = await dynamicNFT.connect(signer).requestLevelUp(tokenId);
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
        console.log(`   -> ✅ Token #${tokenId} đã tiến hóa thành Cấp 2: Hiệp Sĩ Tinh Nhuệ!`);
      }
    }

    if (targetLevel >= 3) {
      console.log(`   -> Đang rèn luyện Token #${tokenId} lên 300 EXP (Cấp 3)...`);
      for (let i = 0; i < 12; i++) {
        const trainTx = await dynamicNFT.connect(signer).trainNFT(tokenId);
        await trainTx.wait();
      }
      const reqTx = await dynamicNFT.connect(signer).requestLevelUp(tokenId);
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
        console.log(`   -> 👑 Token #${tokenId} đã tiến hóa thành Cấp 3: Chúa Tể Huyền Thoại!`);
      }
    }
  }

  // Helper to mint, evolve, approve and list
  async function createAndListNFT(
    signer: any,
    targetLevel: number,
    priceInEth: string,
    description: string
  ) {
    console.log(`\n📦 Khởi tạo vật phẩm mới: ${description}...`);
    const mintTx = await dynamicNFT.connect(signer).mintNFT(signer.address);
    const mintRc = await mintTx.wait();

    const mintEvent = mintRc?.logs
      .map((l: any) => {
        try {
          return dynamicNFT.interface.parseLog(l);
        } catch {
          return null;
        }
      })
      .find((p: any) => p?.name === "NFTMinted");

    const tokenId = mintEvent ? mintEvent.args[0] : await dynamicNFT.totalSupply();
    console.log(`   -> Đã đúc thành công Token #${tokenId.toString()} cho ví ${signer.address.slice(0, 8)}...`);

    // Evolve if needed
    if (targetLevel > 1) {
      await evolveToken(signer, tokenId, targetLevel);
    }

    // Approve marketplace
    const approveTx = await dynamicNFT.connect(signer).approve(marketAddress, tokenId);
    await approveTx.wait();

    // List on marketplace
    const listTx = await marketplace
      .connect(signer)
      .listItem(nftAddress, tokenId, ethers.parseEther(priceInEth));
    await listTx.wait();

    console.log(`   -> 🏷️ Đã niêm yết Token #${tokenId.toString()} lên Chợ với giá: ${priceInEth} ETH!`);
  }

  // 1. Level 1 - Tân Binh cơ bản (Giá rẻ để mua test)
  await createAndListNFT(merchantAlpha, 1, "0.02", "Tân Binh #05 - Giá Khởi Điểm (0.02 ETH)");

  // 2. Level 1 - Tân Binh (EXP 50)
  await createAndListNFT(merchantBeta, 1, "0.045", "Tân Binh #06 - Rèn Luyện Sơ Cấp (0.045 ETH)");

  // 3. Level 2 - Hiệp Sĩ Tinh Nhuệ (Elite Knight)
  await createAndListNFT(merchantGamma, 2, "0.15", "Hiệp Sĩ #07 - Giáp Thép Bạc (0.15 ETH)");

  // 4. Level 2 - Hiệp Sĩ Tinh Nhuệ (Chiến Lực Cao)
  await createAndListNFT(merchantAlpha, 2, "0.22", "Hiệp Sĩ #08 - Khiên Hộ Mệnh On-Chain (0.22 ETH)");

  // 5. Level 3 - Chúa Tể Huyền Thoại (Legendary Champion - Đôi Cánh Lửa)
  await createAndListNFT(merchantBeta, 3, "0.65", "Chúa Tể #09 - Cánh Lửa Huyền Thoại (0.65 ETH)");

  // 6. Level 3 - Chúa Tể Huyền Thoại (Hoàng Kim Siêu Cấp)
  await createAndListNFT(merchantGamma, 3, "1.20", "Chúa Tể #10 - Chiến Giáp Hoàng Kim (1.20 ETH)");

  console.log("\n==========================================================");
  console.log("🎉 HOAN TAT! Da bo sung 6 vat pham moi da dang cap do vao Cho dNFT!");
  console.log("==========================================================");
}

main().catch((err) => {
  console.error("Loi khi seed cho:", err);
  process.exitCode = 1;
});
