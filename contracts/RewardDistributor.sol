// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardDistributor is Ownable {
    IERC20 public immutable rewardToken;

    struct Agent {
        address wallet;
        uint256 reputation;      // 0-100, starts at 50
        uint256 totalEarned;
        uint256 pendingReward;
        uint256 tasksCompleted;
        bool    registered;
    }

    mapping(address => Agent) public agents;
    address[] public agentList;

    uint256 public baseRewardPerTask = 10 * 10 ** 18; // 10 REKT per task
    uint256 public totalDistributed;

    // Events
    event AgentRegistered(address indexed agent, uint256 timestamp);
    event WorkReported(address indexed agent, uint256 score, uint256 reward, uint256 timestamp);
    event RewardClaimed(address indexed agent, uint256 amount, uint256 timestamp);
    event AgentSlashed(address indexed agent, uint256 percent, uint256 newReputation);
    event PoolFunded(address indexed funder, uint256 amount);

    constructor(address _token, address initialOwner) Ownable(initialOwner) {
        rewardToken = IERC20(_token);
    }

    /// @notice Agent registers to receive rewards
    function register() external {
        require(!agents[msg.sender].registered, "Already registered");

        agents[msg.sender] = Agent({
            wallet: msg.sender,
            reputation: 50,
            totalEarned: 0,
            pendingReward: 0,
            tasksCompleted: 0,
            registered: true
        });

        agentList.push(msg.sender);
        emit AgentRegistered(msg.sender, block.timestamp);
    }

    /// @notice Coordinator reports completed work and assigns reward
    function reportWork(
        address agent,
        uint256 score,     // 0-100 quality score
        uint256 rewardAmount
    ) external onlyOwner {
        require(agents[agent].registered, "Agent not registered");
        require(score <= 100, "Score must be 0-100");

        Agent storage a = agents[agent];

        // Scale reward by reputation (50% reputation = 50% reward)
        uint256 adjusted = (rewardAmount * a.reputation) / 100;
        a.pendingReward += adjusted;
        a.tasksCompleted += 1;

        // Update reputation (moving average: 90% old + 10% new)
        a.reputation = (a.reputation * 9 + score) / 10;

        emit WorkReported(agent, score, adjusted, block.timestamp);
    }

    /// @notice Agent claims accumulated rewards
    function claim() external {
        uint256 amount = agents[msg.sender].pendingReward;
        require(amount > 0, "Nothing to claim");

        agents[msg.sender].pendingReward = 0;
        agents[msg.sender].totalEarned += amount;
        totalDistributed += amount;

        require(rewardToken.transfer(msg.sender, amount), "Transfer failed");

        emit RewardClaimed(msg.sender, amount, block.timestamp);
    }

    /// @notice Slash an agent's reputation for bad behavior
    function slash(address agent, uint256 percent) external onlyOwner {
        require(agents[agent].registered, "Agent not registered");
        require(percent <= 100, "Invalid percent");

        Agent storage a = agents[agent];
        a.reputation = a.reputation * (100 - percent) / 100;

        emit AgentSlashed(agent, percent, a.reputation);
    }

    /// @notice Fund the reward pool by depositing REKT tokens
    function fundPool(uint256 amount) external {
        require(rewardToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        emit PoolFunded(msg.sender, amount);
    }

    /// @notice Update base reward per task
    function setBaseReward(uint256 newBase) external onlyOwner {
        baseRewardPerTask = newBase;
    }

    // View functions
    function getAgent(address wallet) external view returns (Agent memory) {
        return agents[wallet];
    }

    function getPendingReward(address wallet) external view returns (uint256) {
        return agents[wallet].pendingReward;
    }

    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }

    function getBalance() external view returns (uint256) {
        return rewardToken.balanceOf(address(this));
    }
}
