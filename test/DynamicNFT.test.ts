import { expect } from "chai";
import { ethers } from "hardhat";
import { DynamicNFT, VRFCoordinatorV2Mock } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("DynamicNFT System", function () {
  let dynamicNFT: DynamicNFT;
  let vrfCoordinatorMock: VRFCoordinatorV2Mock;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  const MOCK_KEY_HASH = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
  const URI_LEVEL_1 = "ipfs://bafybeig...level_1_novice.json";
  const URI_LEVEL_2 = "ipfs://bafybeig...level_2_elite.json";
  const URI_LEVEL_3 = "ipfs://bafybeig...level_3_legendary.json";

  let subId: bigint;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // 1. Deploy VRFCoordinatorV2Mock (baseFee = 0.1 LINK, gasPriceLink = 1e9)
    const VRFCoordinatorMockFactory = await ethers.getContractFactory("VRFCoordinatorV2Mock");
    vrfCoordinatorMock = await VRFCoordinatorMockFactory.deploy(
      ethers.parseEther("0.1"),
      1000000000
    );
    await vrfCoordinatorMock.waitForDeployment();

    // 2. Create and fund subscription
    const tx = await vrfCoordinatorMock.createSubscription();
    const receipt = await tx.wait();
    // Retrieve subId from SubscriptionCreated event
    const event = receipt?.logs
      .map((log) => {
        try {
          return vrfCoordinatorMock.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((parsed) => parsed?.name === "SubscriptionCreated");
    subId = event?.args[0];

    await vrfCoordinatorMock.fundSubscription(subId, ethers.parseEther("10"));

    // 3. Deploy DynamicNFT contract
    const DynamicNFTFactory = await ethers.getContractFactory("DynamicNFT");
    dynamicNFT = await DynamicNFTFactory.deploy(
      await vrfCoordinatorMock.getAddress(),
      subId,
      MOCK_KEY_HASH,
      URI_LEVEL_1,
      URI_LEVEL_2,
      URI_LEVEL_3
    );
    await dynamicNFT.waitForDeployment();

    // 4. Add consumer to subscription
    await vrfCoordinatorMock.addConsumer(subId, await dynamicNFT.getAddress());
  });

  describe("1. Deployment & Configurations", function () {
    it("should initialize name, symbol, and owner correctly", async function () {
      expect(await dynamicNFT.name()).to.equal("Warrior of Light");
      expect(await dynamicNFT.symbol()).to.equal("WOL");
      expect(await dynamicNFT.owner()).to.equal(owner.address);
      expect(await dynamicNFT.totalSupply()).to.equal(0);
    });

    it("should store level URIs correctly", async function () {
      expect(await dynamicNFT.levelToURI(1)).to.equal(URI_LEVEL_1);
      expect(await dynamicNFT.levelToURI(2)).to.equal(URI_LEVEL_2);
      expect(await dynamicNFT.levelToURI(3)).to.equal(URI_LEVEL_3);
    });
  });

  describe("2. Minting Workflow", function () {
    it("should mint a level 1 warrior with correct initial stats and metadata", async function () {
      const tx = await dynamicNFT.mintNFT(user1.address);
      await expect(tx)
        .to.emit(dynamicNFT, "NFTMinted")
        .withArgs(1, user1.address, URI_LEVEL_1);

      expect(await dynamicNFT.totalSupply()).to.equal(1);
      expect(await dynamicNFT.ownerOf(1)).to.equal(user1.address);
      expect(await dynamicNFT.tokenURI(1)).to.equal(URI_LEVEL_1);

      const stats = await dynamicNFT.getNFTStats(1);
      expect(stats.level).to.equal(1);
      expect(stats.exp).to.equal(0);
      expect(stats.attack).to.equal(20);
      expect(stats.defense).to.equal(10);
      expect(stats.speed).to.equal(10);
      expect(stats.isEvolving).to.be.false;
    });

    it("should revert when minting to zero address", async function () {
      await expect(
        dynamicNFT.mintNFT(ethers.ZeroAddress)
      ).to.be.revertedWith("DynamicNFT: Cannot mint to zero address");
    });
  });

  describe("3. Training Workflow", function () {
    beforeEach(async function () {
      await dynamicNFT.mintNFT(user1.address);
    });

    it("should allow token owner to train and gain 25 EXP per session", async function () {
      const tx1 = await dynamicNFT.connect(user1).trainNFT(1);
      await expect(tx1)
        .to.emit(dynamicNFT, "NFTTrained")
        .withArgs(1, 25, 1);

      let stats = await dynamicNFT.getNFTStats(1);
      expect(stats.exp).to.equal(25);

      await dynamicNFT.connect(user1).trainNFT(1);
      await dynamicNFT.connect(user1).trainNFT(1);
      await dynamicNFT.connect(user1).trainNFT(1);

      stats = await dynamicNFT.getNFTStats(1);
      expect(stats.exp).to.equal(100);
    });

    it("should revert when non-owner attempts to train", async function () {
      await expect(
        dynamicNFT.connect(user2).trainNFT(1)
      ).to.be.revertedWith("DynamicNFT: Not the token owner");
    });
  });

  describe("4. Level Up & VRF Random Evolution (Level 1 -> Level 2)", function () {
    beforeEach(async function () {
      await dynamicNFT.mintNFT(user1.address);
    });

    it("should revert if token has insufficient EXP (< 100)", async function () {
      // 3 trains = 75 EXP < 100 threshold
      await dynamicNFT.connect(user1).trainNFT(1);
      await dynamicNFT.connect(user1).trainNFT(1);
      await dynamicNFT.connect(user1).trainNFT(1);

      await expect(
        dynamicNFT.connect(user1).requestLevelUp(1)
      ).to.be.revertedWith("DynamicNFT: Need at least 100 EXP for Level 2");
    });

    it("should lock token state during evolution and unlock upon VRF fulfillment", async function () {
      // Train 4 times to reach 100 EXP
      for (let i = 0; i < 4; i++) {
        await dynamicNFT.connect(user1).trainNFT(1);
      }

      // Request Level Up
      const reqTx = await dynamicNFT.connect(user1).requestLevelUp(1);
      const reqReceipt = await reqTx.wait();
      const levelUpReqEvent = reqReceipt?.logs
        .map((log) => {
          try {
            return dynamicNFT.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((parsed) => parsed?.name === "LevelUpRequested");

      const requestId = levelUpReqEvent?.args[0];
      expect(requestId).to.not.be.undefined;

      // Verify locked state
      let stats = await dynamicNFT.getNFTStats(1);
      expect(stats.isEvolving).to.be.true;

      // Cannot train while evolving
      await expect(
        dynamicNFT.connect(user1).trainNFT(1)
      ).to.be.revertedWith("DynamicNFT: Token is currently evolving");

      // Cannot request level up again while evolving
      await expect(
        dynamicNFT.connect(user1).requestLevelUp(1)
      ).to.be.revertedWith("DynamicNFT: Already awaiting VRF response");

      // Mock Chainlink VRF Coordinator callback
      const fulfillTx = await vrfCoordinatorMock.fulfillRandomWords(
        requestId,
        await dynamicNFT.getAddress()
      );
      await expect(fulfillTx).to.emit(dynamicNFT, "LevelUpCompleted");

      // Check evolved stats
      stats = await dynamicNFT.getNFTStats(1);
      expect(stats.level).to.equal(2);
      expect(stats.isEvolving).to.be.false;
      expect(stats.exp).to.equal(0); // 100 - 100 = 0

      // Bonus stats verification:
      // Base ATK 20 + bonus (20-50) => ATK in [40, 70]
      expect(stats.attack).to.be.greaterThanOrEqual(40);
      expect(stats.attack).to.be.lessThanOrEqual(70);

      // Base DEF 10 + bonus (10-30) => DEF in [20, 40]
      expect(stats.defense).to.be.greaterThanOrEqual(20);
      expect(stats.defense).to.be.lessThanOrEqual(40);

      // Base SPD 10 + bonus (5-20) => SPD in [15, 30]
      expect(stats.speed).to.be.greaterThanOrEqual(15);
      expect(stats.speed).to.be.lessThanOrEqual(30);

      // Verify Metadata URI updated to Level 2
      expect(await dynamicNFT.tokenURI(1)).to.equal(URI_LEVEL_2);
    });
  });

  describe("5. Complete Evolution to Level 3 (Legendary Champion)", function () {
    beforeEach(async function () {
      await dynamicNFT.mintNFT(user1.address);
      // Train to Level 2
      for (let i = 0; i < 4; i++) {
        await dynamicNFT.connect(user1).trainNFT(1);
      }
      const reqTx1 = await dynamicNFT.connect(user1).requestLevelUp(1);
      const receipt1 = await reqTx1.wait();
      const event1 = receipt1?.logs
        .map((l) => {
          try {
            return dynamicNFT.interface.parseLog(l);
          } catch {
            return null;
          }
        })
        .find((p) => p?.name === "LevelUpRequested");
      await vrfCoordinatorMock.fulfillRandomWords(event1?.args[0], await dynamicNFT.getAddress());
    });

    it("should allow evolving from Level 2 to Level 3 once 300 EXP is reached", async function () {
      // Train 12 times to reach 300 EXP (12 * 25 = 300)
      for (let i = 0; i < 12; i++) {
        await dynamicNFT.connect(user1).trainNFT(1);
      }

      let stats = await dynamicNFT.getNFTStats(1);
      expect(stats.level).to.equal(2);
      expect(stats.exp).to.equal(300);

      // Request Level 3 evolution
      const reqTx2 = await dynamicNFT.connect(user1).requestLevelUp(1);
      const receipt2 = await reqTx2.wait();
      const event2 = receipt2?.logs
        .map((l) => {
          try {
            return dynamicNFT.interface.parseLog(l);
          } catch {
            return null;
          }
        })
        .find((p) => p?.name === "LevelUpRequested");

      await vrfCoordinatorMock.fulfillRandomWords(event2?.args[0], await dynamicNFT.getAddress());

      stats = await dynamicNFT.getNFTStats(1);
      expect(stats.level).to.equal(3);
      expect(stats.exp).to.equal(0);
      expect(await dynamicNFT.tokenURI(1)).to.equal(URI_LEVEL_3);

      // Once max level (3) is reached, training and evolving are prohibited
      await expect(
        dynamicNFT.connect(user1).trainNFT(1)
      ).to.be.revertedWith("DynamicNFT: Max level already reached");

      await expect(
        dynamicNFT.connect(user1).requestLevelUp(1)
      ).to.be.revertedWith("DynamicNFT: Already at maximum level");
    });
  });

  describe("6. Administrative Functions", function () {
    it("should allow owner to update level URI and emit event", async function () {
      const NEW_URI = "ipfs://QmNewHash/updated_level_1.json";
      await expect(dynamicNFT.setLevelURI(1, NEW_URI))
        .to.emit(dynamicNFT, "LevelURIUpdated")
        .withArgs(1, NEW_URI);

      expect(await dynamicNFT.levelToURI(1)).to.equal(NEW_URI);
    });

    it("should prevent non-owner from updating level URI", async function () {
      await expect(
        dynamicNFT.connect(user1).setLevelURI(1, "ipfs://malicious")
      ).to.be.revertedWithCustomError(dynamicNFT, "OwnableUnauthorizedAccount");
    });

    it("should allow owner to update callback gas limit", async function () {
      await dynamicNFT.setCallbackGasLimit(300000);
      expect(await dynamicNFT.callbackGasLimit()).to.equal(300000);
    });
  });
});
