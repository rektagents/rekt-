// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    struct AgentInfo {
        address creator;
        string name;
        string category;
        uint256 registeredAt;
        bool isActive;
    }

    mapping(uint256 => AgentInfo) public agentInfo;
    mapping(address => uint256) public walletToToken;
    mapping(string => uint256[]) private _categoryIndex;

    uint256 public totalAgents;
    address public rektToken;

    event AgentMinted(uint256 indexed tokenId, address indexed creator, string name, string category);
    event AgentUpdated(uint256 indexed tokenId, string newMetadataURI);
    event AgentDeactivated(uint256 indexed tokenId);

    constructor(
        address initialOwner,
        address _rektToken
    ) ERC721("REKT Agent", "RAGENT") Ownable(initialOwner) {
        rektToken = _rektToken;
        _nextTokenId = 1;
    }

    function registerAgent(
        string calldata name,
        string calldata category,
        string calldata metadataURI
    ) external returns (uint256) {
        require(walletToToken[msg.sender] == 0, "Already registered");
        require(bytes(name).length > 0, "Name required");
        require(bytes(category).length > 0, "Category required");

        uint256 tokenId = _nextTokenId++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        agentInfo[tokenId] = AgentInfo({
            creator: msg.sender,
            name: name,
            category: category,
            registeredAt: block.timestamp,
            isActive: true
        });

        walletToToken[msg.sender] = tokenId;
        _categoryIndex[category].push(tokenId);
        totalAgents++;

        emit AgentMinted(tokenId, msg.sender, name, category);
        return tokenId;
    }

    function updateMetadata(uint256 tokenId, string calldata newURI) external {
        require(ownerOf(tokenId) == msg.sender, "Not agent owner");
        _setTokenURI(tokenId, newURI);
        emit AgentUpdated(tokenId, newURI);
    }

    function deactivateAgent(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not agent owner");
        agentInfo[tokenId].isActive = false;
        emit AgentDeactivated(tokenId);
    }

    function reactivateAgent(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not agent owner");
        agentInfo[tokenId].isActive = true;
    }

    function isRegistered(address wallet) external view returns (bool) {
        uint256 tokenId = walletToToken[wallet];
        return tokenId > 0 && agentInfo[tokenId].isActive;
    }

    function getTokenByWallet(address wallet) external view returns (uint256) {
        return walletToToken[wallet];
    }

    function getAgentsByCategory(string calldata category) external view returns (uint256[] memory) {
        return _categoryIndex[category];
    }

    /// @dev Override _update to track wallet ownership on transfer
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721) returns (address) {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && from != to) {
            walletToToken[from] = 0;
        }
        if (to != address(0)) {
            walletToToken[to] = tokenId;
        }
        return from;
    }
}
