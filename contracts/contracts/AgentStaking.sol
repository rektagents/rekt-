// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AgentStaking is Ownable, ReentrancyGuard {
    IERC20 public immutable rektToken;

    uint256 public constant COOLDOWN_PERIOD = 7 days;
    uint256 public minStake;

    struct StakeInfo {
        uint256 amount;
        uint256 stakedAt;
        uint256 cooldownStart;
        bool inCooldown;
    }

    // agent address => stake info
    mapping(address => StakeInfo) public stakes;
    // Total staked across all agents
    uint256 public totalStaked;

    event Staked(address indexed agent, uint256 amount, uint256 totalStaked);
    event UnstakeInitiated(address indexed agent, uint256 amount, uint256 cooldownEnd);
    event Unstaked(address indexed agent, uint256 amount);
    event StakeSlashed(address indexed agent, uint256 amount, string reason);
    event MinStakeUpdated(uint256 newMin);

    constructor(address _rektToken, address initialOwner, uint256 _minStake) Ownable(initialOwner) {
        rektToken = IERC20(_rektToken);
        minStake = _minStake;
    }

    /// @notice Stake REKT tokens to boost reputation and bid priority
    function stake(uint256 amount) external nonReentrant {
        require(amount >= minStake, "Below minimum stake");
        require(rektToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        StakeInfo storage s = stakes[msg.sender];
        // If already staked and in cooldown, cancel cooldown
        if (s.inCooldown) {
            s.inCooldown = false;
            s.cooldownStart = 0;
        }

        s.amount += amount;
        if (s.stakedAt == 0) s.stakedAt = block.timestamp;
        totalStaked += amount;

        emit Staked(msg.sender, amount, totalStaked);
    }

    /// @notice Add to existing stake
    function addStake(uint256 amount) external nonReentrant {
        require(stakes[msg.sender].amount > 0, "No existing stake");
        require(rektToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");

        StakeInfo storage s = stakes[msg.sender];
        if (s.inCooldown) {
            s.inCooldown = false;
            s.cooldownStart = 0;
        }
        s.amount += amount;
        totalStaked += amount;

        emit Staked(msg.sender, amount, totalStaked);
    }

    /// @notice Begin unstake cooldown (7 days)
    function initiateUnstake() external {
        StakeInfo storage s = stakes[msg.sender];
        require(s.amount > 0, "Nothing staked");
        require(!s.inCooldown, "Already in cooldown");

        s.inCooldown = true;
        s.cooldownStart = block.timestamp;

        emit UnstakeInitiated(msg.sender, s.amount, block.timestamp + COOLDOWN_PERIOD);
    }

    /// @notice Withdraw after cooldown
    function unstake() external nonReentrant {
        StakeInfo storage s = stakes[msg.sender];
        require(s.inCooldown, "Not in cooldown");
        require(block.timestamp >= s.cooldownStart + COOLDOWN_PERIOD, "Cooldown not finished");

        uint256 amount = s.amount;
        totalStaked -= amount;

        delete stakes[msg.sender];

        require(rektToken.transfer(msg.sender, amount), "Transfer failed");
        emit Unstaked(msg.sender, amount);
    }

    /// @notice Cancel unstake (keep staked)
    function cancelUnstake() external {
        StakeInfo storage s = stakes[msg.sender];
        require(s.inCooldown, "Not in cooldown");
        s.inCooldown = false;
        s.cooldownStart = 0;
    }

    /// @notice Owner can slash a stake for bad behavior
    function slash(address agent, uint256 amount, string calldata reason) external onlyOwner {
        StakeInfo storage s = stakes[agent];
        require(s.amount >= amount, "Insufficient stake");

        s.amount -= amount;
        totalStaked -= amount;

        // Slashed tokens are burned (sent to zero address) or kept in contract
        // Here we keep them in contract as protocol revenue

        emit StakeSlashed(agent, amount, reason);
    }

    // --- View functions ---

    function getStake(address agent) external view returns (uint256) {
        return stakes[agent].amount;
    }

    function getStakeInfo(address agent) external view returns (StakeInfo memory) {
        return stakes[agent];
    }

    function getStakeMultiplier(address agent) external view returns (uint256) {
        // Returns a multiplier (100 = 1x, 200 = 2x) based on stake amount
        // More stake = higher multiplier for reputation and bid priority
        uint256 staked = stakes[agent].amount;
        if (staked == 0) return 100;

        // Log scale: 1x at min stake, up to 3x at 100x min stake
        uint256 ratio = (staked * 100) / minStake;
        if (ratio <= 100) return 100;
        if (ratio >= 10000) return 300;

        // Linear interpolation: 100 + (ratio - 100) * 200 / 9900
        return 100 + ((ratio - 100) * 200) / 9900;
    }

    function canUnstake(address agent) external view returns (bool) {
        StakeInfo storage s = stakes[agent];
        if (!s.inCooldown) return false;
        return block.timestamp >= s.cooldownStart + COOLDOWN_PERIOD;
    }

    function cooldownRemaining(address agent) external view returns (uint256) {
        StakeInfo storage s = stakes[agent];
        if (!s.inCooldown) return 0;
        uint256 cooldownEnd = s.cooldownStart + COOLDOWN_PERIOD;
        if (block.timestamp >= cooldownEnd) return 0;
        return cooldownEnd - block.timestamp;
    }

    // --- Admin ---

    function setMinStake(uint256 _minStake) external onlyOwner {
        minStake = _minStake;
        emit MinStakeUpdated(_minStake);
    }

    function withdrawSlashed() external onlyOwner {
        uint256 balance = rektToken.balanceOf(address(this)) - totalStaked;
        require(balance > 0, "No slashed funds");
        require(rektToken.transfer(owner(), balance), "Transfer failed");
    }
}
