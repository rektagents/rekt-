// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ReputationOracle is Ownable {

    struct ReputationScore {
        uint256 overall;          // 0-10000 (weighted average)
        uint256 taskCompletion;   // 0-10000 (% of tasks completed successfully)
        uint256 qualityScore;     // 0-10000 (average quality rating)
        uint256 reliability;      // 0-10000 (on-time delivery rate)
        uint256 economicWeight;   // total value transacted in REKT wei
        uint256 tasksAttempted;
        uint256 tasksSucceeded;
        uint256 tasksOnTime;
        uint256 lastUpdated;
    }

    // Weights for overall score calculation (basis points, total = 10000)
    uint256 public completionWeight = 3000;  // 30%
    uint256 public qualityWeight = 3500;     // 35%
    uint256 public reliabilityWeight = 2000; // 20%
    uint256 public economicWeightBps = 1500; // 15%

    mapping(address => ReputationScore) public scores;

    // Peer ratings: ratee => rater => rating (0-10000)
    mapping(address => mapping(address => uint256)) public peerRatings;
    mapping(address => uint256) public peerRatingCount;
    mapping(address => uint256) public peerRatingSum; // running sum for O(1) average

    // Anti-Sybil: minimum tasks before reputation counts
    uint256 public minimumTasksForReputation = 3;

    // Tier thresholds
    uint256 public constant TIER_PLATINUM = 9000;
    uint256 public constant TIER_GOLD = 7500;
    uint256 public constant TIER_SILVER = 5000;

    // Authorized callers (AgentRegistry, TaskMarketplace)
    mapping(address => bool) public authorizedCallers;

    event ReputationUpdated(address indexed agent, uint256 oldOverall, uint256 newOverall, uint256 timestamp);
    event PeerRatingSubmitted(address indexed ratee, address indexed rater, uint256 rating);
    event CallerAuthorized(address indexed caller, bool authorized);
    event WeightsUpdated(uint256 completion, uint256 quality, uint256 reliability, uint256 economic);

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    /// @notice Record a task outcome and update reputation
    function recordTaskOutcome(
        address agent,
        uint256 rewardAmount,
        uint8 outcome,       // 0 = failed, 1 = success (on-time), 2 = success (late)
        uint256 qualityScore // 0-10000 from verifier
    ) external onlyAuthorized {
        ReputationScore storage s = scores[agent];

        s.tasksAttempted++;
        s.economicWeight += rewardAmount;

        if (outcome > 0) {
            s.tasksSucceeded++;
            s.taskCompletion = (s.tasksSucceeded * 10000) / s.tasksAttempted;

            // Moving average for quality (90% old + 10% new)
            if (s.qualityScore == 0) {
                s.qualityScore = qualityScore;
            } else {
                s.qualityScore = (s.qualityScore * 9 + qualityScore) / 10;
            }

            if (outcome == 1) {
                s.tasksOnTime++;
            }
            s.reliability = (s.tasksOnTime * 10000) / s.tasksSucceeded;
        } else {
            // Failed task — quality drops
            s.taskCompletion = (s.tasksSucceeded * 10000) / s.tasksAttempted;
        }

        uint256 oldOverall = s.overall;
        s.overall = _calculateOverall(s);
        s.lastUpdated = block.timestamp;

        emit ReputationUpdated(agent, oldOverall, s.overall, block.timestamp);
    }

    /// @notice Submit a peer rating for another agent (only once per pair)
    function submitPeerRating(address ratee, uint256 rating) external {
        require(rating <= 10000, "Rating exceeds max");
        require(peerRatings[ratee][msg.sender] == 0, "Already rated");
        require(msg.sender != ratee, "Can't rate yourself");

        peerRatings[ratee][msg.sender] = rating;
        peerRatingCount[ratee]++;
        peerRatingSum[ratee] += rating;

        // Recalculate quality including peer ratings
        _updatePeerQuality(ratee);

        emit PeerRatingSubmitted(ratee, msg.sender, rating);
    }

    /// @notice Update an existing peer rating
    function updatePeerRating(address ratee, uint256 newRating) external {
        require(newRating <= 10000, "Rating exceeds max");
        require(peerRatings[ratee][msg.sender] != 0, "No existing rating");
        require(msg.sender != ratee, "Can't rate yourself");

        uint256 oldRating = peerRatings[ratee][msg.sender];
        peerRatings[ratee][msg.sender] = newRating;
        peerRatingSum[ratee] = peerRatingSum[ratee] - oldRating + newRating;
        _updatePeerQuality(ratee);

        emit PeerRatingSubmitted(ratee, msg.sender, newRating);
    }

    function _updatePeerQuality(address agent) internal {
        ReputationScore storage s = scores[agent];
        uint256 count = peerRatingCount[agent];
        if (count == 0) return;

        // Average peer rating from running sum (O(1))
        uint256 avgPeerRating = peerRatingSum[agent] / count;

        // Blend: 70% task-based quality, 30% peer-based quality
        if (s.qualityScore == 0) {
            s.qualityScore = avgPeerRating;
        } else {
            s.qualityScore = (s.qualityScore * 7 + avgPeerRating * 3) / 10;
        }

        // Recalculate overall
        s.overall = _calculateOverall(s);
        s.lastUpdated = block.timestamp;
    }

    /// @notice Calculate weighted overall score
    function _calculateOverall(ReputationScore storage s) internal view returns (uint256) {
        if (s.tasksAttempted < minimumTasksForReputation) {
            return 5000; // Default for new agents
        }

        uint256 completion = (s.taskCompletion * completionWeight) / 10000;
        uint256 quality = (s.qualityScore * qualityWeight) / 10000;
        uint256 reliability = (s.reliability * reliabilityWeight) / 10000;

        // Economic weight: logarithmic scaling to prevent whales dominating
        uint256 econScore = _logScale(s.economicWeight);
        uint256 economic = (econScore * economicWeightBps) / 10000;

        return completion + quality + reliability + economic;
    }

    /// @notice Logarithmic scaling for economic weight (prevents whale dominance)
    function _logScale(uint256 value) internal pure returns (uint256) {
        if (value == 0) return 0;
        // Simple log approximation: each 10x multiplier adds 2500 points
        // 1 REKT = 0, 10 REKT = 2500, 100 REKT = 5000, 1000 REKT = 7500, 10000+ REKT = 10000
        uint256 score = 0;
        uint256 threshold = 10 ** 18; // 1 REKT
        while (value >= threshold && score < 10000) {
            score += 2500;
            threshold *= 10;
            if (score >= 10000) break;
        }
        return score > 10000 ? 10000 : score;
    }

    // --- Admin Functions ---

    function authorizeCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
        emit CallerAuthorized(caller, authorized);
    }

    function setWeights(
        uint256 _completion,
        uint256 _quality,
        uint256 _reliability,
        uint256 _economic
    ) external onlyOwner {
        require(_completion + _quality + _reliability + _economic == 10000, "Weights must sum to 10000");
        completionWeight = _completion;
        qualityWeight = _quality;
        reliabilityWeight = _reliability;
        economicWeightBps = _economic;
        emit WeightsUpdated(_completion, _quality, _reliability, _economic);
    }

    function setMinimumTasks(uint256 newMinimum) external onlyOwner {
        minimumTasksForReputation = newMinimum;
    }

    // --- View Functions ---

    function getReputation(address agent) external view returns (ReputationScore memory) {
        return scores[agent];
    }

    function getOverallScore(address agent) external view returns (uint256) {
        return scores[agent].overall;
    }

    function getTier(address agent) external view returns (string memory) {
        return _tier(scores[agent].overall);
    }

    function getTierByScore(uint256 score) external pure returns (string memory) {
        return _tier(score);
    }

    function _tier(uint256 score) internal pure returns (string memory) {
        if (score >= TIER_PLATINUM) return "Platinum";
        if (score >= TIER_GOLD) return "Gold";
        if (score >= TIER_SILVER) return "Silver";
        return "Bronze";
    }

    function getPeerRating(address ratee, address rater) external view returns (uint256) {
        return peerRatings[ratee][rater];
    }
}
