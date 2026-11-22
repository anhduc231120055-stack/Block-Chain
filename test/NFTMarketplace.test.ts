import { expect } from "chai";
import { ethers } from "hardhat";
import { DynamicNFT, NFTMarketplace, VRFCoordinatorV2Mock } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("NFTMarketplace", function () {
  let dynamicNFT: DynamicNFT;
  let marketplace: NFTMarketplace;
  let vrfCoordinatorMock: VRFCoordinatorV2Mock;
  let owner: SignerWithAddress;
  let seller: SignerWithAddress;
  let buyer: SignerWithAddress;
  let feeRecipient: SignerWithAddress;

  const MOCK_KEY_HASH = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c";
  const URI_1 = "ipfs://level_1.json";
  const URI_2 = "ipfs://level_2.json";
  const URI_3 = "ipfs://level_3.json";

  const LISTING_PRICE = ethers.parseEther("0.1"); // 0.1 ETH

  beforeEach(async function () {
    [owner, seller, buyer, feeRecipient] = await ethers.getSigners();

    // 1. Deploy VRF Coordinator Mock
    const VRFFactory = await ethers.getContractFactory("VRFCoordinatorV2Mock");
    vrfCoordinatorMock = await VRFFactory.deploy(ethers.parseEther("0.1"), 1000000000);
    await vrfCoordinatorMock.waitForDeployment();

    // 2. Deploy DynamicNFT
    const NFTFactory = await ethers.getContractFactory("DynamicNFT");
    dynamicNFT = await NFTFactory.deploy(
      await vrfCoordinatorMock.getAddress(),
      1,
      MOCK_KEY_HASH,
      URI_1,
      URI_2,
      URI_3
    );
    await dynamicNFT.waitForDeployment();

    // 3. Deploy NFTMarketplace
    const MarketplaceFactory = await ethers.getContractFactory("NFTMarketplace");
    marketplace = await MarketplaceFactory.deploy(feeRecipient.address);
    await marketplace.waitForDeployment();

    // 4. Mint an NFT for seller
    await dynamicNFT.mintNFT(seller.address);
  });

  describe("1. Listing Items", function () {
    it("should revert if price is 0", async function () {
      await expect(
        marketplace.connect(seller).listItem(await dynamicNFT.getAddress(), 1, 0)
      ).to.be.revertedWith("NFTMarketplace: Price must be greater than 0");
    });

    it("should revert if not token owner", async function () {
      await expect(
        marketplace.connect(buyer).listItem(await dynamicNFT.getAddress(), 1, LISTING_PRICE)
      ).to.be.revertedWith("NFTMarketplace: Not token owner");
    });

    it("should revert if marketplace is not approved", async function () {
      await expect(
        marketplace.connect(seller).listItem(await dynamicNFT.getAddress(), 1, LISTING_PRICE)
      ).to.be.revertedWith("NFTMarketplace: Marketplace not approved");
    });

    it("should list item successfully once approved", async function () {
      await dynamicNFT.connect(seller).approve(await marketplace.getAddress(), 1);

      await expect(
        marketplace.connect(seller).listItem(await dynamicNFT.getAddress(), 1, LISTING_PRICE)
      )
        .to.emit(marketplace, "ItemListed")
        .withArgs(await dynamicNFT.getAddress(), 1, seller.address, LISTING_PRICE);

      const listing = await marketplace.getListing(await dynamicNFT.getAddress(), 1);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(LISTING_PRICE);
      expect(listing.isActive).to.be.true;
    });
  });

  describe("2. Updating & Canceling Listings", function () {
    beforeEach(async function () {
      await dynamicNFT.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).listItem(await dynamicNFT.getAddress(), 1, LISTING_PRICE);
    });

    it("should allow seller to update price", async function () {
      const NEW_PRICE = ethers.parseEther("0.15");
      await expect(
        marketplace.connect(seller).updateListing(await dynamicNFT.getAddress(), 1, NEW_PRICE)
      )
        .to.emit(marketplace, "ListingUpdated")
        .withArgs(await dynamicNFT.getAddress(), 1, seller.address, NEW_PRICE);

      const listing = await marketplace.getListing(await dynamicNFT.getAddress(), 1);
      expect(listing.price).to.equal(NEW_PRICE);
    });

    it("should allow seller to cancel listing", async function () {
      await expect(
        marketplace.connect(seller).cancelListing(await dynamicNFT.getAddress(), 1)
      )
        .to.emit(marketplace, "ItemCanceled")
        .withArgs(await dynamicNFT.getAddress(), 1, seller.address);

      const listing = await marketplace.getListing(await dynamicNFT.getAddress(), 1);
      expect(listing.isActive).to.be.false;
    });
  });

  describe("3. Buying Listed Items", function () {
    beforeEach(async function () {
      await dynamicNFT.connect(seller).approve(await marketplace.getAddress(), 1);
      await marketplace.connect(seller).listItem(await dynamicNFT.getAddress(), 1, LISTING_PRICE);
    });

    it("should revert if insufficient ETH sent", async function () {
      await expect(
        marketplace.connect(buyer).buyItem(await dynamicNFT.getAddress(), 1, {
          value: ethers.parseEther("0.05"),
        })
      ).to.be.revertedWith("NFTMarketplace: Insufficient ETH sent");
    });

    it("should execute purchase, transfer NFT, pay seller and fee recipient", async function () {
      const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);
      const feeBalanceBefore = await ethers.provider.getBalance(feeRecipient.address);

      // 1% fee on 0.1 ETH = 0.001 ETH
      // Seller proceeds = 0.099 ETH
      const tx = await marketplace.connect(buyer).buyItem(await dynamicNFT.getAddress(), 1, {
        value: LISTING_PRICE,
      });

      await expect(tx)
        .to.emit(marketplace, "ItemBought")
        .withArgs(await dynamicNFT.getAddress(), 1, buyer.address, seller.address, LISTING_PRICE);

      // Verify NFT ownership transferred to buyer
      expect(await dynamicNFT.ownerOf(1)).to.equal(buyer.address);

      // Verify seller balance increased by 0.099 ETH
      const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
      expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(ethers.parseEther("0.099"));

      // Verify fee recipient received 0.001 ETH
      const feeBalanceAfter = await ethers.provider.getBalance(feeRecipient.address);
      expect(feeBalanceAfter - feeBalanceBefore).to.equal(ethers.parseEther("0.001"));

      // Verify listing is now inactive
      const listing = await marketplace.getListing(await dynamicNFT.getAddress(), 1);
      expect(listing.isActive).to.be.false;
    });

    it("should refund excess ETH if buyer overpays", async function () {
      const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

      // Send 0.2 ETH for a 0.1 ETH item
      const tx = await marketplace.connect(buyer).buyItem(await dynamicNFT.getAddress(), 1, {
        value: ethers.parseEther("0.2"),
      });
      const receipt = await tx.wait();
      const gasSpent = receipt!.gasUsed * receipt!.gasPrice;

      const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);

      // Net deduction should be approximately 0.1 ETH + gasSpent
      const netPaid = buyerBalanceBefore - buyerBalanceAfter - gasSpent;
      expect(netPaid).to.equal(LISTING_PRICE);
    });
  });

  describe("4. Admin Operations", function () {
    it("should allow owner to update fee percentage and recipient", async function () {
      await marketplace.connect(owner).setFeePercentage(200); // 2%
      expect(await marketplace.feePercentageBasisPoints()).to.equal(200);

      await marketplace.connect(owner).setFeeRecipient(seller.address);
      expect(await marketplace.feeRecipient()).to.equal(seller.address);
    });

    it("should prevent non-owner from updating fee", async function () {
      await expect(
        marketplace.connect(buyer).setFeePercentage(500)
      ).to.be.revertedWithCustomError(marketplace, "OwnableUnauthorizedAccount");
    });
  });
});
