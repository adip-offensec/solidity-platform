export interface SecurityVulnerability {
  id: string;
  title: string;
  category: "Access Control" | "Reentrancy" | "Arithmetic" | "Low-Level Call" | "Storage Collision" | "Frontrunning / MEV" | "Gas Exhaustion";
  severity: "Critical" | "High" | "Medium" | "Low";
  solidityVersion: string;
  summary: string;
  vulnerableCodeSnippet: string;
  exploitExplanation: string;
  fixedCodeSnippet: string;
  securityReasoning: string;
  officialDocReference: string;
  relatedExerciseId?: string;
}

export const SECURITY_CATALOG: SecurityVulnerability[] = [
  {
    id: "sec-reentrancy-classic",
    title: "Classic & Cross-Function Reentrancy",
    category: "Reentrancy",
    severity: "Critical",
    solidityVersion: "0.8.37",
    summary: "External calls hand over execution control to receiving contracts. If contract state is updated AFTER an external call, the recipient can recursively re-enter the calling function to drain funds.",
    vulnerableCodeSnippet: `function withdrawAll() public {
    uint256 balance = userBalances[msg.sender];
    require(balance > 0);

    // VULNERABLE: Transfer before zeroing balance
    (bool sent, ) = msg.sender.call{value: balance}("");
    require(sent);

    userBalances[msg.sender] = 0;
}`,
    exploitExplanation: "An attacker deploys a contract with a `receive()` function that immediately calls `withdrawAll()` again. Since `userBalances[msg.sender]` has not been set to 0 yet, the contract passes the check and sends funds repeatedly until the vault is emptied.",
    fixedCodeSnippet: `function withdrawAll() public {
    uint256 balance = userBalances[msg.sender];
    require(balance > 0);

    // SECURE: Update internal state FIRST (Checks-Effects-Interactions)
    userBalances[msg.sender] = 0;

    (bool sent, ) = msg.sender.call{value: balance}("");
    require(sent, "Transfer failed");
}`,
    securityReasoning: "Adhering to Checks-Effects-Interactions (CEI) guarantees that internal state changes occur prior to external control handoff. Reentrant invocations will encounter zeroed balance checks and revert.",
    officialDocReference: "https://docs.soliditylang.org/en/v0.8.37/security-considerations.html#re-entrancy",
    relatedExerciseId: "ex-security-reentrancy"
  },
  {
    id: "sec-tx-origin-phishing",
    title: "Authentication via `tx.origin` Phishing",
    category: "Access Control",
    severity: "High",
    solidityVersion: "0.8.37",
    summary: "Using `tx.origin` for authorization allows malicious intermediate contracts to trick authorized users into executing privileged administrative functions.",
    vulnerableCodeSnippet: `function transferOwnership(address newOwner) public {
    // VULNERABLE: tx.origin checks the original transaction signer, not caller
    require(tx.origin == owner, "Not owner");
    owner = newOwner;
}`,
    exploitExplanation: "An attacker tricks the contract `owner` into interacting with a malicious contract. The malicious contract calls `transferOwnership()`. `msg.sender` is the malicious contract, but `tx.origin` is the victim owner's address. The check succeeds and ownership is stolen!",
    fixedCodeSnippet: `function transferOwnership(address newOwner) public {
    // SECURE: Always use msg.sender for authorization
    require(msg.sender == owner, "Not owner");
    owner = newOwner;
}`,
    securityReasoning: "`msg.sender` represents the immediate caller of the current function invocation, preventing unauthorized inter-contract forwarding attacks.",
    officialDocReference: "https://docs.soliditylang.org/en/v0.8.37/security-considerations.html#tx-origin"
  },
  {
    id: "sec-delegatecall-storage-collision",
    title: "Delegatecall Storage Slot Collision",
    category: "Storage Collision",
    severity: "Critical",
    solidityVersion: "0.8.37",
    summary: "Executing code via `delegatecall` runs target logic within caller storage. Mismatched storage variable declarations overwrite caller storage slots unpredictably.",
    vulnerableCodeSnippet: `// Proxy Contract Storage
contract Proxy {
    address public implementation; // Slot 0
    address public owner;          // Slot 1
}

// Target Logic Storage
contract Logic {
    address public owner;          // Slot 0 (MISMATCH! Overwrites Proxy.implementation!)
}`,
    exploitExplanation: "When Proxy delegatecalls `Logic.setOwner()`, Logic assigns `owner` to Slot 0. But in Proxy, Slot 0 is `implementation`! The proxy's logic address gets corrupted with the owner address.",
    fixedCodeSnippet: `// Use EIP-1967 Unstructured Storage Slots
bytes32 private constant IMPL_SLOT = bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1);

function _getImplementation() internal view returns (address impl) {
    bytes32 slot = IMPL_SLOT;
    assembly {
        impl := sload(slot)
    }
}`,
    securityReasoning: "EIP-1967 unstructured storage slots place system addresses at pseudo-random high storage slots (`keccak256(...) - 1`) to completely prevent collisions with implementation contract storage slots starting at 0.",
    officialDocReference: "https://docs.soliditylang.org/en/v0.8.37/introduction-to-smart-contracts.html#delegatecall-callcode-and-libraries"
  }
];
