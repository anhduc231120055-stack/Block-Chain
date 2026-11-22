// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";

/**
 * @title DynamicNFT
 * @dev Dynamic NFT contract with Chainlink VRF v2 verifiable randomness,
 * leveling system, dynamic stats and IPFS metadata evolution.
 */
contract DynamicNFT is ERC721URIStorage, VRFConsumerBaseV2, Ownable {
    // --- Structs ---
    struct NFTStats {
        uint256 level;
        uint256 exp;
        uint256 attack;
        uint256 defense;
        uint256 speed;
        bool isEvolving;
    }

    struct LevelUpRequest {
        uint256 tokenId;
        address requester;
        bool completed;
    }

    // --- State Variables ---
    uint256 private _tokenIds;

    mapping(uint256 => NFTStats) public nftStats;
    mapping(uint256 => LevelUpRequest) public levelUpRequests;
    mapping(uint256 => string) public levelToURI;

    // Experience thresholds
    uint256 public constant EXP_LEVEL_2_THRESHOLD = 100;
    uint256 public constant EXP_LEVEL_3_THRESHOLD = 300;
    uint256 public constant EXP_PER_TRAIN = 25;

    // Chainlink VRF v2 Parameters
    VRFCoordinatorV2Interface public immutable COORDINATOR;
    uint64 public immutable s_subscriptionId;
    bytes32 public immutable keyHash;
    uint32 public callbackGasLimit = 250000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;

    // --- Events ---
    event NFTMinted(uint256 indexed tokenId, address indexed owner, string initialURI);
    event NFTTrained(uint256 indexed tokenId, uint256 currentExp, uint256 level);
    event LevelUpRequested(uint256 indexed requestId, uint256 indexed tokenId, address indexed requester);
    event LevelUpCompleted(uint256 indexed tokenId, uint256 newLevel, uint256 bonusAtk, string newURI);
    event LevelURIUpdated(uint256 indexed level, string newURI);

    constructor(
        address vrfCoordinator,
        uint64 subscriptionId,
        bytes32 _keyHash,
        string memory uriLevel1,
        string memory uriLevel2,
        string memory uriLevel3
    )
        ERC721("Warrior of Light", "WOL")
        VRFConsumerBaseV2(vrfCoordinator)
        Ownable(msg.sender)
    {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_subscriptionId = subscriptionId;
        keyHash = _keyHash;

        levelToURI[1] = uriLevel1;
        levelToURI[2] = uriLevel2;
        levelToURI[3] = uriLevel3;
    }

    /**
     * @notice Mint a new Level 1 Warrior NFT
     * @param recipient The address receiving the newly minted NFT
     * @return newItemId The Token ID of the minted NFT
     */
    function mintNFT(address recipient) external returns (uint256) {
        require(recipient != address(0), "DynamicNFT: Cannot mint to zero address");
        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _safeMint(recipient, newItemId);

        // Khởi tạo chỉ số tân binh Level 1
        nftStats[newItemId] = NFTStats({
            level: 1,
            exp: 0,
            attack: 20,
            defense: 10,
            speed: 10,
            isEvolving: false
        });

        // Gán tokenURI trỏ tới metadata Level 1 trên IPFS
        string memory initialURI = levelToURI[1];
        if (bytes(initialURI).length > 0) {
            _setTokenURI(newItemId, initialURI);
        }

        emit NFTMinted(newItemId, recipient, initialURI);
        return newItemId;
    }

    /**
     * @notice Train an NFT to gain experience points
     * @param tokenId The ID of the token to train
     */
    function trainNFT(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "DynamicNFT: Not the token owner");
        NFTStats storage stats = nftStats[tokenId];
        require(!stats.isEvolving, "DynamicNFT: Token is currently evolving");
        require(stats.level < 3, "DynamicNFT: Max level already reached");

        stats.exp += EXP_PER_TRAIN;
        emit NFTTrained(tokenId, stats.exp, stats.level);
    }

    /**
     * @notice Request evolution/level up via Chainlink VRF v2
     * @param tokenId The ID of the token requesting level up
     * @return requestId The Chainlink VRF request ID
     */
    function requestLevelUp(uint256 tokenId) external returns (uint256 requestId) {
        require(ownerOf(tokenId) == msg.sender, "DynamicNFT: Not the token owner");
        NFTStats storage stats = nftStats[tokenId];
        require(!stats.isEvolving, "DynamicNFT: Already awaiting VRF response");
        require(stats.level < 3, "DynamicNFT: Already at maximum level");

        // Kiểm tra ngưỡng điểm kinh nghiệm cần thiết
        if (stats.level == 1) {
            require(stats.exp >= EXP_LEVEL_2_THRESHOLD, "DynamicNFT: Need at least 100 EXP for Level 2");
        } else if (stats.level == 2) {
            require(stats.exp >= EXP_LEVEL_3_THRESHOLD, "DynamicNFT: Need at least 300 EXP for Level 3");
        }

        // Đánh dấu token đang trong quá trình tiến hóa để khóa giao dịch trùng lặp
        stats.isEvolving = true;

        // Gửi yêu cầu sinh số ngẫu nhiên tới Chainlink VRF Coordinator
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        levelUpRequests[requestId] = LevelUpRequest({
            tokenId: tokenId,
            requester: msg.sender,
            completed: false
        });

        emit LevelUpRequested(requestId, tokenId, msg.sender);
        return requestId;
    }

    /**
     * @notice Chainlink VRF callback that fulfills the random number and completes evolution
     * @param requestId The request ID assigned by VRF Coordinator
     * @param randomWords Array of cryptographically verifiable random numbers
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        LevelUpRequest storage req = levelUpRequests[requestId];
        require(!req.completed, "DynamicNFT: Request already fulfilled");
        req.completed = true;

        uint256 tokenId = req.tokenId;
        NFTStats storage stats = nftStats[tokenId];
        require(stats.isEvolving, "DynamicNFT: Invalid token evolution state");

        // Giải phóng cờ trạng thái
        stats.isEvolving = false;

        // 1. Tăng cấp độ
        stats.level += 1;
        uint256 newLevel = stats.level;

        // 2. Tính toán điểm thưởng thuộc tính từ số ngẫu nhiên 256-bit
        uint256 bonusAtk = (randomWords[0] % 31) + 20; // Bonus ATK: 20 -> 50
        uint256 bonusDef = ((randomWords[0] / 100) % 21) + 10; // Bonus DEF: 10 -> 30
        uint256 bonusSpd = ((randomWords[0] / 10000) % 16) + 5; // Bonus SPD: 5 -> 20

        stats.attack += bonusAtk;
        stats.defense += bonusDef;
        stats.speed += bonusSpd;

        // 3. Khấu trừ điểm kinh nghiệm đã sử dụng
        if (newLevel == 2) {
            stats.exp -= EXP_LEVEL_2_THRESHOLD;
        } else if (newLevel == 3) {
            stats.exp = 0; // Đạt cấp tối đa, reset EXP
        }

        // 4. CẬP NHẬT METADATA URI ĐỘNG TRỎ SANG CID MỚI TRÊN IPFS
        string memory newURI = levelToURI[newLevel];
        if (bytes(newURI).length > 0) {
            _setTokenURI(tokenId, newURI);
        }

        emit LevelUpCompleted(tokenId, newLevel, bonusAtk, newURI);
    }

    /**
     * @notice Get all dynamic stats of a specific token
     * @param tokenId The ID of the token
     * @return NFTStats struct containing level, exp, attack, defense, speed, isEvolving
     */
    function getNFTStats(uint256 tokenId) external view returns (NFTStats memory) {
        _requireOwned(tokenId);
        return nftStats[tokenId];
    }

    /**
     * @notice Get total supply of NFTs minted so far
     * @return Total count of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    /**
     * @notice Update metadata URI for a specific level (Admin only)
     * @param level Level to update (1, 2, or 3)
     * @param newURI The IPFS URI for this level
     */
    function setLevelURI(uint256 level, string memory newURI) external onlyOwner {
        require(level >= 1 && level <= 3, "DynamicNFT: Invalid level");
        levelToURI[level] = newURI;
        emit LevelURIUpdated(level, newURI);
    }

    /**
     * @notice Set callback gas limit for Chainlink VRF (Admin only)
     * @param newLimit Gas limit for fulfillRandomWords callback
     */
    function setCallbackGasLimit(uint32 newLimit) external onlyOwner {
        callbackGasLimit = newLimit;
    }
}
