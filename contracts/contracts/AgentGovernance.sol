// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentGovernance is Ownable {
    // Voting power = staked REKT (checked via AgentStaking contract)

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        string metadataURI;     // full proposal details on IPFS
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startBlock;
        uint256 endBlock;
        bool executed;
        bool cancelled;
        // What parameter to change
        bytes callData;         // encoded function call
        address targetContract; // which contract to call
    }

    uint256 public proposalCount;
    uint256 public votingPeriod;     // in blocks
    uint256 public quorumPercent;    // % of total voting power needed
    uint256 public proposalThreshold; // min stake to propose

    address public stakingContract; // AgentStaking address

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => mapping(address => bool)) public voteChoice; // true = for

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        uint256 startBlock,
        uint256 endBlock
    );
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId);
    event ProposalCancelled(uint256 indexed proposalId);
    event VotingPeriodUpdated(uint256 newPeriod);
    event QuorumUpdated(uint256 newQuorum);
    event ThresholdUpdated(uint256 newThreshold);

    constructor(
        address initialOwner,
        address _stakingContract,
        uint256 _votingPeriod,
        uint256 _quorumPercent,
        uint256 _proposalThreshold
    ) Ownable(initialOwner) {
        stakingContract = _stakingContract;
        votingPeriod = _votingPeriod;       // e.g. 40320 = ~1 week on Base (2s blocks)
        quorumPercent = _quorumPercent;     // e.g. 10 = 10%
        proposalThreshold = _proposalThreshold;
    }

    /// @notice Create a new proposal
    function propose(
        string calldata _description,
        string calldata _metadataURI,
        address _targetContract,
        bytes calldata _callData
    ) external returns (uint256) {
        // Check proposer has enough stake
        (uint256 stakeAmount) = getStake(msg.sender);
        require(stakeAmount >= proposalThreshold, "Insufficient stake to propose");

        proposalCount++;
        uint256 proposalId = proposalCount;

        proposals[proposalId] = Proposal({
            id: proposalId,
            proposer: msg.sender,
            description: _description,
            metadataURI: _metadataURI,
            forVotes: 0,
            againstVotes: 0,
            startBlock: block.number,
            endBlock: block.number + votingPeriod,
            executed: false,
            cancelled: false,
            callData: _callData,
            targetContract: _targetContract
        });

        emit ProposalCreated(proposalId, msg.sender, _description, block.number, block.number + votingPeriod);
        return proposalId;
    }

    /// @notice Cast a vote
    function castVote(uint256 proposalId, bool support) external {
        Proposal storage p = proposals[proposalId];
        require(block.number <= p.endBlock, "Voting ended");
        require(block.number >= p.startBlock, "Voting not started");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        (uint256 weight) = getStake(msg.sender);
        require(weight > 0, "No voting power");

        hasVoted[proposalId][msg.sender] = true;
        voteChoice[proposalId][msg.sender] = support;

        if (support) {
            p.forVotes += weight;
        } else {
            p.againstVotes += weight;
        }

        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    /// @notice Execute a passed proposal
    function executeProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(!p.executed, "Already executed");
        require(!p.cancelled, "Cancelled");
        require(block.number > p.endBlock, "Voting not ended");
        require(p.forVotes > p.againstVotes, "Proposal did not pass");

        // Check quorum
        uint256 totalVotes = p.forVotes + p.againstVotes;
        uint256 totalVotingPower = getTotalVotingPower();
        require(
            totalVotes >= (totalVotingPower * quorumPercent) / 100,
            "Quorum not reached"
        );

        p.executed = true;

        // Execute the call
        if (p.targetContract != address(0) && p.callData.length > 0) {
            (bool success, ) = p.targetContract.call(p.callData);
            require(success, "Execution failed");
        }

        emit ProposalExecuted(proposalId);
    }

    /// @notice Cancel a proposal (proposer or owner)
    function cancelProposal(uint256 proposalId) external {
        Proposal storage p = proposals[proposalId];
        require(
            msg.sender == p.proposer || msg.sender == owner(),
            "Not authorized"
        );
        require(!p.executed, "Already executed");

        p.cancelled = true;
        emit ProposalCancelled(proposalId);
    }

    // --- View functions ---

    function getProposal(uint256 proposalId) external view returns (Proposal memory) {
        return proposals[proposalId];
    }

    function getProposalState(uint256 proposalId) external view returns (string memory) {
        Proposal storage p = proposals[proposalId];

        if (p.cancelled) return "Cancelled";
        if (p.executed) return "Executed";
        if (block.number <= p.startBlock) return "Pending";
        if (block.number <= p.endBlock) return "Active";

        uint256 totalVotes = p.forVotes + p.againstVotes;
        uint256 totalVotingPower = getTotalVotingPower();
        bool quorumReached = totalVotes >= (totalVotingPower * quorumPercent) / 100;

        if (!quorumReached) return "Defeated (No Quorum)";
        if (p.forVotes > p.againstVotes) return "Succeeded";
        return "Defeated";
    }

    function getVotingPower(address voter) external view returns (uint256) {
        return getStake(voter);
    }

    // --- Internal ---

    function getStake(address agent) internal view returns (uint256) {
        // Call staking contract
        (bool success, bytes memory data) = stakingContract.staticcall(
            abi.encodeWithSignature("getStake(address)", agent)
        );
        if (success && data.length >= 32) {
            return abi.decode(data, (uint256));
        }
        return 0;
    }

    function getTotalVotingPower() internal view returns (uint256) {
        (bool success, bytes memory data) = stakingContract.staticcall(
            abi.encodeWithSignature("totalStaked()")
        );
        if (success && data.length >= 32) {
            return abi.decode(data, (uint256));
        }
        return 0;
    }

    // --- Admin ---

    function setVotingPeriod(uint256 _period) external onlyOwner {
        votingPeriod = _period;
        emit VotingPeriodUpdated(_period);
    }

    function setQuorum(uint256 _percent) external onlyOwner {
        require(_percent <= 50, "Max 50%");
        quorumPercent = _percent;
        emit QuorumUpdated(_percent);
    }

    function setProposalThreshold(uint256 _threshold) external onlyOwner {
        proposalThreshold = _threshold;
        emit ThresholdUpdated(_threshold);
    }

    function setStakingContract(address _staking) external onlyOwner {
        stakingContract = _staking;
    }
}
