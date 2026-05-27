// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AgentRegistry is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable rektToken;

    struct AgentProfile {
        address owner;
        string metadataURI;
        uint256 registeredAt;
        uint256 reputation;       // 0-10000 (represents 0.00 - 100.00)
        uint256 totalEarned;
        uint256 tasksCompleted;
        uint256 stakedAmount;
        bool isActive;
    }

    mapping(address => AgentProfile) public agents;
    address[] public agentList;

    uint256 public minimumStake = 100 * 10 ** 18; // 100 REKT minimum
    uint256 public totalStaked;
    uint256 public registrationCount;

    // Events
    event AgentRegistered(address indexed agent, string metadataURI, uint256 stake, uint256 timestamp);
    event AgentUpdated(address indexed agent, string newMetadataURI, uint256 timestamp);
    event AgentDeactivated(address indexed agent, uint256 timestamp);
    event StakeAdded(address indexed agent, uint256 amount, uint256 totalStake);
    event StakeWithdrawn(address indexed agent, uint256 amount, uint256 timestamp);
    event ReputationUpdated(address indexed agent, uint256 oldReputation, uint256 newReputation);
    event MinimumStakeUpdated(uint256 oldMinimum, uint256 newMinimum);

    modifier onlyRegistered() {
        require(agents[msg.sender].isActive, "Not a registered agent");
        _;
    }

    modifier onlyRegisteredAgent(address agent) {
        require(agents[agent].isActive, "Agent not registered");
        _;
    }

    constructor(address _token, address initialOwner) Ownable(initialOwner) {
        rektToken = IERC20(_token);
    }

    /// @notice Register a new agent with metadata and stake
    function registerAgent(string calldata metadataURI) external payable nonReentrant {
        require(!agents[msg.sender].isActive, "Already registered");
        require(bytes(metadataURI).length > 0, "Empty metadata URI");
        require(msg.value >= minimumStake, "Below minimum stake");

        agents[msg.sender] = AgentProfile({
            owner: msg.sender,
            metadataURI: metadataURI,
            registeredAt: block.timestamp,
            reputation: 5000,        // start at 50.00
            totalEarned: 0,
            tasksCompleted: 0,
            stakedAmount: msg.value,
            isActive: true
        });

        agentList.push(msg.sender);
        totalStaked += msg.value;
        registrationCount++;

        emit AgentRegistered(msg.sender, metadataURI, msg.value, block.timestamp);
    }

    /// @notice Update agent metadata URI
    function updateMetadata(string calldata newMetadataURI) external onlyRegistered {
        require(bytes(newMetadataURI).length > 0, "Empty metadata URI");
        agents[msg.sender].metadataURI = newMetadataURI;
        emit AgentUpdated(msg.sender, newMetadataURI, block.timestamp);
    }

    /// @notice Add more stake to your agent
    function addStake() external payable onlyRegistered nonReentrant {
        require(msg.value > 0, "Must stake something");
        agents[msg.sender].stakedAmount += msg.value;
        totalStaked += msg.value;
        emit StakeAdded(msg.sender, msg.value, agents[msg.sender].stakedAmount);
    }

    /// @notice Withdraw excess stake (must maintain minimum)
    function withdrawStake(uint256 amount) external onlyRegistered nonReentrant {
        AgentProfile storage a = agents[msg.sender];
        require(a.stakedAmount - amount >= minimumStake, "Would go below minimum stake");

        a.stakedAmount -= amount;
        totalStaked -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "ETH transfer failed");

        emit StakeWithdrawn(msg.sender, amount, block.timestamp);
    }

    /// @notice Deactivate your agent and withdraw all stake
    function deactivate() external onlyRegistered nonReentrant {
        AgentProfile storage a = agents[msg.sender];
        uint256 stake = a.stakedAmount;

        a.isActive = false;
        a.stakedAmount = 0;
        totalStaked -= stake;

        if (stake > 0) {
            (bool success, ) = payable(msg.sender).call{value: stake}("");
            require(success, "ETH transfer failed");
        }

        emit AgentDeactivated(msg.sender, block.timestamp);
    }

    /// @notice Update an agent's reputation (called by ReputationOracle or owner)
    function updateReputation(address agent, uint256 newReputation) external onlyOwner onlyRegisteredAgent(agent) {
        require(newReputation <= 10000, "Reputation exceeds max");
        uint256 oldRep = agents[agent].reputation;
        agents[agent].reputation = newReputation;
        emit ReputationUpdated(agent, oldRep, newReputation);
    }

    /// @notice Record task completion and earnings for an agent
    function recordTaskCompletion(address agent, uint256 rewardAmount) external onlyOwner onlyRegisteredAgent(agent) {
        agents[agent].tasksCompleted += 1;
        agents[agent].totalEarned += rewardAmount;
    }

    /// @notice Owner can update minimum stake requirement
    function setMinimumStake(uint256 newMinimum) external onlyOwner {
        uint256 old = minimumStake;
        minimumStake = newMinimum;
        emit MinimumStakeUpdated(old, newMinimum);
    }

    // --- View Functions ---

    function getAgent(address wallet) external view returns (AgentProfile memory) {
        return agents[wallet];
    }

    function getReputation(address wallet) external view returns (uint256) {
        return agents[wallet].reputation;
    }

    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }

    function getAgentList() external view returns (address[] memory) {
        return agentList;
    }

    function isRegistered(address wallet) external view returns (bool) {
        return agents[wallet].isActive;
    }

    function getReputationTier(address wallet) external view returns (string memory) {
        uint256 rep = agents[wallet].reputation;
        if (rep >= 9000) return "Platinum";
        if (rep >= 7500) return "Gold";
        if (rep >= 5000) return "Silver";
        return "Bronze";
    }

    function getReputationTierByValue(uint256 reputation) external pure returns (string memory) {
        if (reputation >= 9000) return "Platinum";
        if (reputation >= 7500) return "Gold";
        if (reputation >= 5000) return "Silver";
        return "Bronze";
    }

    receive() external payable {}
}
