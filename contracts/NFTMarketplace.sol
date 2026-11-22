// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NFTMarketplace
 * @dev Decentralized marketplace for Dynamic NFTs with ETH settlement,
 * cancellation, price updating, and reentrancy protection.
 */
contract NFTMarketplace is ReentrancyGuard, Ownable {
    struct Listing {
        address seller;
        uint256 price;
        bool isActive;
    }

    // Platform fee percentage in basis points (e.g. 100 = 1%)
    uint256 public feePercentageBasisPoints = 100; // 1%
    address payable public feeRecipient;

    // nftAddress => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    // Events
    event ItemListed(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event ItemBought(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed buyer,
        address seller,
        uint256 price
    );
    event ItemCanceled(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed seller
    );
    event ListingUpdated(
        address indexed nftAddress,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 newPrice
    );
    event FeeUpdated(uint256 newFeeBasisPoints);
    event FeeRecipientUpdated(address newRecipient);

    constructor(address payable _feeRecipient) Ownable(msg.sender) {
        require(_feeRecipient != address(0), "NFTMarketplace: Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }

    /**
     * @notice List an NFT for sale
     * @param nftAddress Contract address of the NFT
     * @param tokenId Token ID of the NFT
     * @param price Price in wei (must be > 0)
     */
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        require(price > 0, "NFTMarketplace: Price must be greater than 0");
        IERC721 nft = IERC721(nftAddress);
        require(nft.ownerOf(tokenId) == msg.sender, "NFTMarketplace: Not token owner");
        require(
            nft.getApproved(tokenId) == address(this) || nft.isApprovedForAll(msg.sender, address(this)),
            "NFTMarketplace: Marketplace not approved"
        );

        listings[nftAddress][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            isActive: true
        });

        emit ItemListed(nftAddress, tokenId, msg.sender, price);
    }

    /**
     * @notice Buy a listed NFT using ETH
     * @param nftAddress Contract address of the NFT
     * @param tokenId Token ID of the NFT
     */
    function buyItem(
        address nftAddress,
        uint256 tokenId
    ) external payable nonReentrant {
        Listing storage listing = listings[nftAddress][tokenId];
        require(listing.isActive, "NFTMarketplace: Item is not for sale");
        require(msg.value >= listing.price, "NFTMarketplace: Insufficient ETH sent");

        address seller = listing.seller;
        uint256 price = listing.price;

        // Mark inactive before transfers (Checks-Effects-Interactions pattern)
        listing.isActive = false;

        // Calculate platform fee and seller proceed
        uint256 fee = (price * feePercentageBasisPoints) / 10000;
        uint256 sellerProceed = price - fee;

        // Transfer NFT to buyer
        IERC721(nftAddress).safeTransferFrom(seller, msg.sender, tokenId);

        // Payout seller
        (bool successSeller, ) = payable(seller).call{value: sellerProceed}("");
        require(successSeller, "NFTMarketplace: Failed to send ETH to seller");

        // Payout platform fee
        if (fee > 0) {
            (bool successFee, ) = feeRecipient.call{value: fee}("");
            require(successFee, "NFTMarketplace: Failed to send fee");
        }

        // Refund any excess ETH sent
        if (msg.value > price) {
            (bool successRefund, ) = payable(msg.sender).call{value: msg.value - price}("");
            require(successRefund, "NFTMarketplace: Failed to refund excess ETH");
        }

        emit ItemBought(nftAddress, tokenId, msg.sender, seller, price);
    }

    /**
     * @notice Cancel an active listing
     * @param nftAddress Contract address of the NFT
     * @param tokenId Token ID of the NFT
     */
    function cancelListing(
        address nftAddress,
        uint256 tokenId
    ) external nonReentrant {
        Listing storage listing = listings[nftAddress][tokenId];
        require(listing.isActive, "NFTMarketplace: Item not listed");
        require(listing.seller == msg.sender, "NFTMarketplace: Not seller");

        listing.isActive = false;
        emit ItemCanceled(nftAddress, tokenId, msg.sender);
    }

    /**
     * @notice Update price of an active listing
     * @param nftAddress Contract address of the NFT
     * @param tokenId Token ID of the NFT
     * @param newPrice New price in wei
     */
    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external nonReentrant {
        require(newPrice > 0, "NFTMarketplace: Price must be greater than 0");
        Listing storage listing = listings[nftAddress][tokenId];
        require(listing.isActive, "NFTMarketplace: Item not listed");
        require(listing.seller == msg.sender, "NFTMarketplace: Not seller");

        listing.price = newPrice;
        emit ListingUpdated(nftAddress, tokenId, msg.sender, newPrice);
    }

    /**
     * @notice Check listing details
     */
    function getListing(
        address nftAddress,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return listings[nftAddress][tokenId];
    }

    /**
     * @notice Set platform fee basis points (Owner only)
     */
    function setFeePercentage(uint256 newFeeBasisPoints) external onlyOwner {
        require(newFeeBasisPoints <= 1000, "NFTMarketplace: Fee cannot exceed 10%");
        feePercentageBasisPoints = newFeeBasisPoints;
        emit FeeUpdated(newFeeBasisPoints);
    }

    /**
     * @notice Set fee recipient address (Owner only)
     */
    function setFeeRecipient(address payable newRecipient) external onlyOwner {
        require(newRecipient != address(0), "NFTMarketplace: Invalid fee recipient");
        feeRecipient = newRecipient;
        emit FeeRecipientUpdated(newRecipient);
    }
}
