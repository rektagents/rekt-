// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TaskMarketplace is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable rektToken;

    enum TaskType { Computation, Research, Trading, Content, Custom }
    enum TaskStatus { Open, Claimed, Submitted, Verified, Disputed, Cancelled, Expired }

    struct Task {
        address poster;
        address worker;
        uint256 reward;
        uint256 deadline;
        uint256 createdAt;
        uint256 completedAt;
        TaskType taskType;
        TaskStatus status;
        string taskDataURI;    // IPFS/Arweave with full task details
        string proofURI;       // worker submits proof here
        bytes32 conditionHash; // hash of completion criteria
    }

    struct TaskApplication {
        address applicant;
        string proposal;
        uint256 proposedReward;
        uint256 appliedAt;
    }

    uint256 public nextTaskId = 1;
    mapping(uint256 => Task) public tasks;
    mapping(uint256 => TaskApplication[]) public applications;

    // Track tasks per agent
    mapping(address => uint256[]) public posterTasks;
    mapping(address => uint256[]) public workerTasks;

    // Platform fee (basis points, 100 = 1%)
    uint256 public platformFeeBps = 250; // 2.5%
    address public feeRecipient;

    uint256 public totalTasksCreated;
    uint256 public totalVolume;

    // Events
    event TaskCreated(
        uint256 indexed taskId,
        address indexed poster,
        uint256 reward,
        TaskType taskType,
        uint256 deadline,
        string taskDataURI
    );
    event TaskClaimed(uint256 indexed taskId, address indexed worker, uint256 timestamp);
    event WorkSubmitted(uint256 indexed taskId, address indexed worker, string proofURI, uint256 timestamp);
    event TaskVerified(uint256 indexed taskId, address indexed poster, address indexed worker, uint256 reward, uint256 timestamp);
    event TaskDisputed(uint256 indexed taskId, address indexed disputer, uint256 timestamp);
    event TaskCancelled(uint256 indexed taskId, address indexed poster, uint256 timestamp);
    event TaskExpired(uint256 indexed taskId, uint256 timestamp);
    event ApplicationSubmitted(uint256 indexed taskId, address indexed applicant, string proposal);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(address _token, address _feeRecipient, address initialOwner) Ownable(initialOwner) {
        rektToken = IERC20(_token);
        feeRecipient = _feeRecipient;
    }

    /// @notice Post a new task with REKT reward (tokens escrowed)
    function postTask(
        string calldata taskDataURI,
        uint256 reward,
        uint256 deadline,
        TaskType taskType,
        bytes32 conditionHash
    ) external nonReentrant returns (uint256 taskId) {
        require(bytes(taskDataURI).length > 0, "Empty task data");
        require(reward > 0, "Zero reward");
        require(deadline > block.timestamp, "Deadline must be future");

        // Escrow the reward
        rektToken.safeTransferFrom(msg.sender, address(this), reward);

        taskId = nextTaskId++;
        tasks[taskId] = Task({
            poster: msg.sender,
            worker: address(0),
            reward: reward,
            deadline: deadline,
            createdAt: block.timestamp,
            completedAt: 0,
            taskType: taskType,
            status: TaskStatus.Open,
            taskDataURI: taskDataURI,
            proofURI: "",
            conditionHash: conditionHash
        });

        posterTasks[msg.sender].push(taskId);
        totalTasksCreated++;
        totalVolume += reward;

        emit TaskCreated(taskId, msg.sender, reward, taskType, deadline, taskDataURI);
    }

    /// @notice Apply for a task (poster chooses who gets it)
    function applyForTask(uint256 taskId, string calldata proposal) external {
        Task storage t = tasks[taskId];
        require(t.status == TaskStatus.Open, "Task not open");
        require(t.poster != msg.sender, "Can't apply to own task");
        require(block.timestamp < t.deadline, "Deadline passed");

        applications[taskId].push(TaskApplication({
            applicant: msg.sender,
            proposal: proposal,
            proposedReward: t.reward,
            appliedAt: block.timestamp
        }));

        emit ApplicationSubmitted(taskId, msg.sender, proposal);
    }

    /// @notice Poster assigns a worker from applicants (or direct claim)
    function claimTask(uint256 taskId, address worker) external {
        Task storage t = tasks[taskId];
        require(t.status == TaskStatus.Open, "Task not open");
        require(msg.sender == t.poster, "Only poster can assign");
        require(block.timestamp < t.deadline, "Deadline passed");

        t.worker = worker;
        t.status = TaskStatus.Claimed;

        workerTasks[worker].push(taskId);

        emit TaskClaimed(taskId, worker, block.timestamp);
    }

    /// @notice Worker submits proof of completion
    function submitWork(uint256 taskId, string calldata proofURI) external {
        Task storage t = tasks[taskId];
        require(t.status == TaskStatus.Claimed, "Task not claimed");
        require(msg.sender == t.worker, "Not the assigned worker");

        t.proofURI = proofURI;
        t.status = TaskStatus.Submitted;

        emit WorkSubmitted(taskId, msg.sender, proofURI, block.timestamp);
    }

    /// @notice Poster verifies work and releases payment
    function verifyTask(uint256 taskId, bool approved) external nonReentrant {
        Task storage t = tasks[taskId];
        require(t.status == TaskStatus.Submitted, "Task not submitted");
        require(msg.sender == t.poster, "Only poster can verify");

        if (approved) {
            // Deduct platform fee
            uint256 fee = (t.reward * platformFeeBps) / 10000;
            uint256 workerPayout = t.reward - fee;

            if (fee > 0) {
                rektToken.safeTransfer(feeRecipient, fee);
            }
            rektToken.safeTransfer(t.worker, workerPayout);

            t.status = TaskStatus.Verified;
            t.completedAt = block.timestamp;

            emit TaskVerified(taskId, msg.sender, t.worker, workerPayout, block.timestamp);
        } else {
            // Reject — poster gets refund
            rektToken.safeTransfer(t.poster, t.reward);
            t.status = TaskStatus.Open;
            t.worker = address(0);
            t.proofURI = "";
        }
    }

    /// @notice Either party can dispute (owner resolves)
    function disputeTask(uint256 taskId) external {
        Task storage t = tasks[taskId];
        require(
            t.status == TaskStatus.Submitted || t.status == TaskStatus.Claimed,
            "Cannot dispute"
        );
        require(msg.sender == t.poster || msg.sender == t.worker, "Not involved");

        t.status = TaskStatus.Disputed;
        emit TaskDisputed(taskId, msg.sender, block.timestamp);
    }

    /// @notice Owner resolves dispute — pay worker or refund poster
    function resolveDispute(uint256 taskId, bool payWorker) external onlyOwner nonReentrant {
        Task storage t = tasks[taskId];
        require(t.status == TaskStatus.Disputed, "Not disputed");

        if (payWorker) {
            uint256 fee = (t.reward * platformFeeBps) / 10000;
            uint256 payout = t.reward - fee;
            if (fee > 0) rektToken.safeTransfer(feeRecipient, fee);
            rektToken.safeTransfer(t.worker, payout);
            t.status = TaskStatus.Verified;
            t.completedAt = block.timestamp;
        } else {
            rektToken.safeTransfer(t.poster, t.reward);
            t.status = TaskStatus.Cancelled;
        }
    }

    /// @notice Poster cancels an open task (full refund, no penalty if not yet claimed)
    function cancelTask(uint256 taskId) external nonReentrant {
        Task storage t = tasks[taskId];
        require(msg.sender == t.poster, "Only poster can cancel");
        require(t.status == TaskStatus.Open || t.status == TaskStatus.Claimed, "Cannot cancel");

        rektToken.safeTransfer(t.poster, t.reward);
        t.status = TaskStatus.Cancelled;

        emit TaskCancelled(taskId, msg.sender, block.timestamp);
    }

    /// @notice Anyone can mark an expired task (past deadline, still open)
    function expireTask(uint256 taskId) external nonReentrant {
        Task storage t = tasks[taskId];
        require(t.status == TaskStatus.Open, "Not open");
        require(block.timestamp > t.deadline, "Not past deadline");

        rektToken.safeTransfer(t.poster, t.reward);
        t.status = TaskStatus.Expired;

        emit TaskExpired(taskId, block.timestamp);
    }

    /// @notice Owner updates platform fee
    function setPlatformFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 1000, "Fee too high"); // max 10%
        uint256 old = platformFeeBps;
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(old, newFeeBps);
    }

    /// @notice Owner updates fee recipient
    function setFeeRecipient(address newRecipient) external onlyOwner {
        require(newRecipient != address(0), "Zero address");
        feeRecipient = newRecipient;
    }

    // --- View Functions ---

    function getTask(uint256 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }

    function getApplications(uint256 taskId) external view returns (TaskApplication[] memory) {
        return applications[taskId];
    }

    function getPosterTasks(address poster) external view returns (uint256[] memory) {
        return posterTasks[poster];
    }

    function getWorkerTasks(address worker) external view returns (uint256[] memory) {
        return workerTasks[worker];
    }

    function getApplicationCount(uint256 taskId) external view returns (uint256) {
        return applications[taskId].length;
    }
}
