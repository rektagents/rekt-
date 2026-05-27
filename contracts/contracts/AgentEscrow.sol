// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract AgentEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable rektToken;

    enum EscrowStatus { Created, Released, Refunded, Disputed }

    struct Escrow {
        address payer;         // agent creating the escrow
        address payee;         // agent receiving payment
        uint256 amount;
        bytes32 conditionHash; // hash of completion criteria
        uint256 timeout;       // deadline for payee to fulfill
        uint256 createdAt;
        EscrowStatus status;
        string memo;           // human-readable description
    }

    uint256 public nextEscrowId = 1;
    mapping(uint256 => Escrow) public escrows;

    // Track escrows per agent
    mapping(address => uint256[]) public payerEscrows;
    mapping(address => uint256[]) public payeeEscrows;

    uint256 public totalEscrowed;
    uint256 public totalCompleted;

    // Events
    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        bytes32 conditionHash,
        uint256 timeout,
        string memo
    );
    event EscrowReleased(uint256 indexed escrowId, address indexed payer, address indexed payee, uint256 amount);
    event EscrowRefunded(uint256 indexed escrowId, address indexed payer, uint256 amount);
    event EscrowDisputed(uint256 indexed escrowId, address indexed disputer);
    event EscrowResolved(uint256 indexed escrowId, bool payToPayee, uint256 amount);

    constructor(address _token, address initialOwner) Ownable(initialOwner) {
        rektToken = IERC20(_token);
    }

    /// @notice Create a new escrow — funds locked until released or timeout
    function createEscrow(
        address payee,
        uint256 amount,
        bytes32 conditionHash,
        uint256 timeout,
        string calldata memo
    ) external nonReentrant returns (uint256 escrowId) {
        require(payee != address(0), "Zero payee");
        require(payee != msg.sender, "Can't escrow to yourself");
        require(amount > 0, "Zero amount");
        require(timeout > block.timestamp, "Timeout must be future");

        // Lock the funds
        rektToken.safeTransferFrom(msg.sender, address(this), amount);

        escrowId = nextEscrowId++;
        escrows[escrowId] = Escrow({
            payer: msg.sender,
            payee: payee,
            amount: amount,
            conditionHash: conditionHash,
            timeout: timeout,
            createdAt: block.timestamp,
            status: EscrowStatus.Created,
            memo: memo
        });

        payerEscrows[msg.sender].push(escrowId);
        payeeEscrows[payee].push(escrowId);
        totalEscrowed += amount;

        emit EscrowCreated(escrowId, msg.sender, payee, amount, conditionHash, timeout, memo);
    }

    /// @notice Payer releases funds to payee (confirms work is done)
    function releaseEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Created, "Not active");
        require(msg.sender == e.payer, "Only payer can release");

        e.status = EscrowStatus.Released;
        totalEscrowed -= e.amount;
        totalCompleted++;

        rektToken.safeTransfer(e.payee, e.amount);

        emit EscrowReleased(escrowId, e.payer, e.payee, e.amount);
    }

    /// @notice Payer releases partial amount and refunds remainder
    function releasePartial(uint256 escrowId, uint256 releaseAmount) external nonReentrant {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Created, "Not active");
        require(msg.sender == e.payer, "Only payer can release");
        require(releaseAmount > 0 && releaseAmount <= e.amount, "Invalid amount");

        uint256 refundAmount = e.amount - releaseAmount;
        e.amount = 0;
        e.status = EscrowStatus.Released;
        totalEscrowed -= (releaseAmount + refundAmount);
        totalCompleted++;

        if (releaseAmount > 0) {
            rektToken.safeTransfer(e.payee, releaseAmount);
        }
        if (refundAmount > 0) {
            rektToken.safeTransfer(e.payer, refundAmount);
        }

        emit EscrowReleased(escrowId, e.payer, e.payee, releaseAmount);
    }

    /// @notice Either party can refund after timeout expires
    function refundAfterTimeout(uint256 escrowId) external nonReentrant {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Created, "Not active");
        require(block.timestamp > e.timeout, "Not yet timed out");
        require(msg.sender == e.payer || msg.sender == e.payee, "Not involved");

        e.status = EscrowStatus.Refunded;
        totalEscrowed -= e.amount;

        rektToken.safeTransfer(e.payer, e.amount);

        emit EscrowRefunded(escrowId, e.payer, e.amount);
    }

    /// @notice Either party disputes (owner resolves)
    function disputeEscrow(uint256 escrowId) external {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Created, "Not active");
        require(msg.sender == e.payer || msg.sender == e.payee, "Not involved");

        e.status = EscrowStatus.Disputed;
        emit EscrowDisputed(escrowId, msg.sender);
    }

    /// @notice Owner resolves dispute
    function resolveDispute(uint256 escrowId, bool payToPayee) external onlyOwner nonReentrant {
        Escrow storage e = escrows[escrowId];
        require(e.status == EscrowStatus.Disputed, "Not disputed");

        totalEscrowed -= e.amount;
        totalCompleted++;

        if (payToPayee) {
            e.status = EscrowStatus.Released;
            rektToken.safeTransfer(e.payee, e.amount);
        } else {
            e.status = EscrowStatus.Refunded;
            rektToken.safeTransfer(e.payer, e.amount);
        }

        emit EscrowResolved(escrowId, payToPayee, e.amount);
    }

    // --- View Functions ---

    function getEscrow(uint256 escrowId) external view returns (Escrow memory) {
        return escrows[escrowId];
    }

    function getPayerEscrows(address payer) external view returns (uint256[] memory) {
        return payerEscrows[payer];
    }

    function getPayeeEscrows(address payee) external view returns (uint256[] memory) {
        return payeeEscrows[payee];
    }

    function getBalance() external view returns (uint256) {
        return rektToken.balanceOf(address(this));
    }
}
