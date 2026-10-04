export interface CoverageTopic {
  id: string;
  docSection: string;
  title: string;
  solidityVersion: string;
  prerequisites: string[];
  level: number; // 0 to 6
  summary: string;
  officialDocUrl: string;
  requiresPracticalExercise: boolean;
  requiresSecurityExplanation: boolean;
  securityTopics?: string[];
  relatedConcepts: string[];
  keyOmissionsToAvoid: string[];
}

export const SOLIDITY_COVERAGE_MAP: CoverageTopic[] = [
  // LEVEL 0 — PREREQUISITES
  {
    id: "l0-blockchain-evm-basics",
    docSection: "Introduction to Smart Contracts",
    title: "Blockchain, Ethereum & EVM Architecture",
    solidityVersion: "0.8.37",
    prerequisites: [],
    level: 0,
    summary: "Foundational mental model of decentralized state machines, block production, accounts (EOA vs Contract), gas, transactions, and the EVM stack.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/introduction-to-smart-contracts.html",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["Transaction Origin vs Sender", "Public Ledger Visibility"],
    relatedConcepts: ["Accounts", "Gas", "State Machine", "EVM Stack"],
    keyOmissionsToAvoid: ["Difference between EOA and Contract Accounts", "Transaction execution flow in EVM"]
  },

  // LEVEL 1 — FUNDAMENTALS
  {
    id: "l1-source-files-pragmas",
    docSection: "Layout of a Solidity Source File",
    title: "Source Files, Pragmas & Import Directives",
    solidityVersion: "0.8.37",
    prerequisites: ["l0-blockchain-evm-basics"],
    level: 1,
    summary: "SPDX license identifiers, pragma version specifications, experimental pragmas (e.g. ABIEncoderV2), and global vs path imports.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/layout-of-source-files.html",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: false,
    relatedConcepts: ["Compiler versions", "SPDX-License-Identifier", "Module scope"],
    keyOmissionsToAvoid: ["Floating pragmas in production risk", "Named import syntax"]
  },
  {
    id: "l1-contract-structure-variables",
    docSection: "Structure of a Contract",
    title: "Contract Anatomy, State Variables, & Constants",
    solidityVersion: "0.8.37",
    prerequisites: ["l1-source-files-pragmas"],
    level: 1,
    summary: "Contract layout, state variables, local variables, constants vs immutable variables, and variable initialization scope.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/structure-of-a-contract.html",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["Uninitialized State Variables", "Default Value Pitfalls"],
    relatedConcepts: ["Storage", "Immutable", "Constant", "Scope"],
    keyOmissionsToAvoid: ["Gas saving difference between constant and immutable", "Default zero values for uninitialized types"]
  },
  {
    id: "l1-value-types",
    docSection: "Types - Value Types",
    title: "Value Types: Integers, Booleans, Addresses, & Bytes",
    solidityVersion: "0.8.37",
    prerequisites: ["l1-contract-structure-variables"],
    level: 1,
    summary: "Fixed-sized value types: int8-int256, uint8-uint256, bool, address & address payable, fixed-size byte arrays (bytes1 to bytes32).",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/types.html#value-types",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["Arithmetic Overflow/Underflow (Solidity >=0.8 unchecked block)", "Address type conversion safety"],
    relatedConcepts: ["Type conversion", "Address Payable", "Literal evaluation"],
    keyOmissionsToAvoid: ["Address payable transfer/send capabilities", "Unchecked arithmetic block behavior in 0.8+"]
  },

  // LEVEL 2 — CORE SOLIDITY
  {
    id: "l2-reference-types-arrays-bytes",
    docSection: "Types - Reference Types",
    title: "Reference Types: Dynamic Arrays, Bytes, Strings & Slices",
    solidityVersion: "0.8.37",
    prerequisites: ["l1-value-types"],
    level: 2,
    summary: "Dynamic vs fixed arrays, array members (.length, .push, .pop), dynamic bytes vs string, and calldata array slices.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/types.html#array-types",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["DoS with Unbounded Loops over Dynamic Arrays", "Memory array allocation limits"],
    relatedConcepts: ["Memory", "Storage", "Array Slices", "Gas Costs"],
    keyOmissionsToAvoid: ["Array memory instantiation requires explicit fixed size", "Storage array deletion semantics"]
  },
  {
    id: "l2-structs-enums-mappings",
    docSection: "Types - Structs, Enums, Mappings",
    title: "Structs, Enums, & Key-Value Mappings",
    solidityVersion: "0.8.37",
    prerequisites: ["l2-reference-types-arrays-bytes"],
    level: 2,
    summary: "User-defined composite types (structs), enumerated states (enums), and non-iterable hash table mappings.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/types.html#mapping-types",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["Mapping key existence illusion (returns zero value)", "Nested struct storage pointer overwrites"],
    relatedConcepts: ["Nested Mappings", "Iterable Mapping pattern", "Enum underlying uint8 type"],
    keyOmissionsToAvoid: ["Mappings cannot be iterated or keys enumerated natively", "Mappings are disallowed in memory/calldata"]
  },
  {
    id: "l2-control-structures-errors",
    docSection: "Control Structures & Error Handling",
    title: "Control Flow, Require, Revert, Assert & Custom Errors",
    solidityVersion: "0.8.37",
    prerequisites: ["l2-structs-enums-mappings"],
    level: 2,
    summary: "Conditionals, loops, error signaling with require vs revert vs assert, panic errors, and gas-efficient custom errors with parameters.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/control-structures.html",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["Assert failure consumes all gas (in earlier versions / Panic error in 0.8)", "Custom Error gas optimization"],
    relatedConcepts: ["Custom Errors", "Panic Codes", "Try/Catch"],
    keyOmissionsToAvoid: ["Difference between require() error string vs custom error selector gas usage", "Assert vs Require execution semantics"]
  },
  {
    id: "l2-modifiers-events",
    docSection: "Contracts - Modifiers & Events",
    title: "Function Modifiers & EVM Log Events",
    solidityVersion: "0.8.37",
    prerequisites: ["l2-control-structures-errors"],
    level: 2,
    summary: "Function modifiers, merge wildcards (_;), reentrancy guard pattern with modifiers, EVM topic indexing, and indexed event parameters.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/contracts.html#events",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["Checks-Effects-Interactions pattern in modifiers", "Multiple modifier execution order vulnerabilities"],
    relatedConcepts: ["EVM Logs", "Indexed Topics", "Reentrancy Guard"],
    keyOmissionsToAvoid: ["Maximum 3 indexed parameters in indexed event topics", "Execution flow of code placed after `_;` in modifiers"]
  },

  // LEVEL 3 — CONTRACT ARCHITECTURE
  {
    id: "l3-constructors-inheritance",
    docSection: "Contracts - Inheritance & Constructors",
    title: "Constructors, Single & Multiple Inheritance, C3 Linearization",
    solidityVersion: "0.8.37",
    prerequisites: ["l2-modifiers-events"],
    level: 3,
    summary: "Contract initialization, constructor hierarchy, `is` keyword, virtual and override modifiers, and C3 Linearization resolution order.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/contracts.html#inheritance",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["Storage layout collisions in inheritance", "Incorrect super call order"],
    relatedConcepts: ["C3 Linearization", "Virtual/Override", "Abstract Contracts"],
    keyOmissionsToAvoid: ["C3 Linearization 'most base to most derived' rule", "Uncalled base constructors in complex inheritance"]
  },
  {
    id: "l3-abstract-interfaces-libraries",
    docSection: "Contracts - Interfaces & Libraries",
    title: "Abstract Contracts, Interfaces, & Libraries (`using for`)",
    solidityVersion: "0.8.37",
    prerequisites: ["l3-constructors-inheritance"],
    level: 3,
    summary: "Incomplete contract signatures, interface constraints (no state, no constructors), library syntax, delegatecall execution context, and `using B for A` attach directives.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/contracts.html#interfaces",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["Library state modifications via delegatecall", "Interface mismatch silent reverts"],
    relatedConcepts: ["Using For", "Internal vs External Library Functions", "EIP-165"],
    keyOmissionsToAvoid: ["Internal library functions are inlined while external library functions require separate deployment and linking"]
  },

  // LEVEL 4 — DATA LOCATIONS & EVM CONCEPTS
  {
    id: "l4-storage-memory-calldata",
    docSection: "Data Location & EVM Memory Layout",
    title: "Storage, Memory, Calldata & Storage Slot Layout",
    solidityVersion: "0.8.37",
    prerequisites: ["l3-abstract-interfaces-libraries"],
    level: 4,
    summary: "Deep dive into EVM state architecture: Storage 32-byte slots, tight variable packing, Memory scratch space/free memory pointer (0x40), and immutable Calldata payload.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/internals/layout_in_storage.html",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["Storage pointer uninitialized overwrites", "Memory expansion gas cost scaling"],
    relatedConcepts: ["SSTORE", "SLOAD", "Free Memory Pointer", "Storage Packing"],
    keyOmissionsToAvoid: ["Slot calculation formula for mappings `keccak256(key . slot)` and dynamic arrays `keccak256(slot) + index`"]
  },
  {
    id: "l4-abi-encoding-function-selectors",
    docSection: "ABI Specification & Dispatch Logic",
    title: "ABI Specification, Function Selectors & `abi.encode` / `decode`",
    solidityVersion: "0.8.37",
    prerequisites: ["l4-storage-memory-calldata"],
    level: 4,
    summary: "Function signature hashing (`bytes4(keccak256('func(uint256)'))`), contract dispatch table logic, `abi.encode`, `abi.encodePacked`, and `abi.decode`.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/abi-spec.html",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["Hash collisions with `abi.encodePacked` with multiple dynamic types"],
    relatedConcepts: ["Function Selector", "EVM Calldata Parsing", "ABI Spec"],
    keyOmissionsToAvoid: ["Why `abi.encodePacked` can cause hash collision vulnerabilities if dynamic arguments are adjacent"]
  },

  // LEVEL 5 — ETHEREUM & CONTRACT INTERACTION
  {
    id: "l5-ether-transfers-receive-fallback",
    docSection: "Contracts - Receive & Fallback Functions",
    title: "Ether Handling: `receive()`, `fallback()`, `transfer`, `send`, & `call`",
    solidityVersion: "0.8.37",
    prerequisites: ["l4-abi-encoding-function-selectors"],
    level: 5,
    summary: "Handling Ether deposits, `receive() external payable` vs `fallback() external payable`, gas limit differences between `transfer` (2300 gas limit), `send`, and `payable(addr).call{value: v}(\"\")`.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/contracts.html#receive-ether-function",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["Reentrancy during raw Ether transfer", "2300 Gas Limit hardfork breakage in transfer/send"],
    relatedConcepts: ["Ether Transfers", "Reentrancy", "Fallback Execution"],
    keyOmissionsToAvoid: ["Why `call{value: x}(\"\")` is the recommended method over `transfer()` due to gas cost changes"]
  },
  {
    id: "l5-low-level-calls-delegatecall",
    docSection: "Control Structures - External Calls & Delegatecall",
    title: "Low-Level External Calls: `.call()`, `.staticcall()`, & `.delegatecall()`",
    solidityVersion: "0.8.37",
    prerequisites: ["l5-ether-transfers-receive-fallback"],
    level: 5,
    summary: "Context preservation (msg.sender, msg.value, storage context) in `delegatecall`, read-only safety with `staticcall`, and low-level call return value handling.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/introduction-to-smart-contracts.html#delegatecall-callcode-and-libraries",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["Storage layout corruption via delegatecall", "Untrusted contract delegatecall risks", "Unchecked low-level call return values"],
    relatedConcepts: ["Proxy Patterns", "Storage Collisions", "Staticcall"],
    keyOmissionsToAvoid: ["Delegatecall executes code of target in caller's storage context and msg.sender context"]
  },

  // LEVEL 6 — ADVANCED SOLIDITY & YUL
  {
    id: "l6-user-defined-value-types-function-types",
    docSection: "Types - User-Defined Value Types & Function Types",
    title: "User-Defined Value Types (UDVT) & Internal/External Function Pointers",
    solidityVersion: "0.8.37",
    prerequisites: ["l5-low-level-calls-delegatecall"],
    level: 6,
    summary: "Type-safe abstraction wrappers (`type MyInt is uint256`), custom type bound operators, and function pointers (internal vs external function variables).",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/types.html#user-defined-value-types",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["Function pointer manipulation and unauthorized code jump risks"],
    relatedConcepts: ["Zero-cost Abstractions", "Function Pointers", "Type Casting"],
    keyOmissionsToAvoid: ["UDVTs have zero runtime cost and prevent accidental unit conversion bugs"]
  },
  {
    id: "l6-inline-assembly-yul",
    docSection: "Inline Assembly & Yul",
    title: "Inline Assembly, Yul Dialect & Low-Level EVM Opcodes",
    solidityVersion: "0.8.37",
    prerequisites: ["l6-user-defined-value-types-function-types"],
    level: 6,
    summary: "Direct opcode manipulation (`mstore`, `sstore`, `mload`, `add`, `keccak256`), Yul block scope (`assembly { ... }`), memory safety annotations (`assembly (\"memory-safe\") { ... }`).",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/assembly.html",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["Bypassing Solidity safety checks in Yul", "Corrupting free memory pointer in inline assembly"],
    relatedConcepts: ["Yul", "EVM Opcodes", "Memory-safe assembly"],
    keyOmissionsToAvoid: ["Solidty 0.8+ bounds checks and overflow checks are bypassed inside inline assembly"]
  },

  // DEDICATED SECURITY MODULES
  {
    id: "sec-reentrancy-vulnerabilities",
    docSection: "Security Considerations - Reentrancy",
    title: "Reentrancy Attacks & Checks-Effects-Interactions (CEI) Pattern",
    solidityVersion: "0.8.37",
    prerequisites: ["l5-ether-transfers-receive-fallback"],
    level: 5,
    summary: "Comprehensive study of Single-function, Cross-function, and Read-only Reentrancy. Code pattern transformation to secure contracts.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/security-considerations.html#re-entrancy",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["Single Reentrancy", "Cross-function Reentrancy", "Read-only Reentrancy", "ReentrancyGuard"],
    relatedConcepts: ["Checks-Effects-Interactions", "Mutex Lock", "ERC721/1155 Received Hooks"],
    keyOmissionsToAvoid: ["Read-only reentrancy exploiting intermediate state in view functions during oracle calls"]
  },
  {
    id: "sec-access-control-tx-origin",
    docSection: "Security Considerations - Access Control & Authentication",
    title: "Access Control, Ownership, Role-Based Systems & `tx.origin` Phishing",
    solidityVersion: "0.8.37",
    prerequisites: ["l2-modifiers-events"],
    level: 3,
    summary: "Designing robust access controls (Ownable, AccessControl roles), distinguishing `msg.sender` vs `tx.origin`, and phishing exploit patterns.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/security-considerations.html#tx-origin",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["tx.origin Phishing Attack", "Missing Access Control", "Unprotected Initializers"],
    relatedConcepts: ["Ownable", "Role-Based Access Control", "Initializer Guards"],
    keyOmissionsToAvoid: ["Why tx.origin is vulnerable when an authorized contract calls a malicious intermediary"]
  },
  {
    id: "sec-oracle-dos-frontrunning",
    docSection: "Security Considerations - Frontrunning & Denial of Service",
    title: "Denial of Service (DoS), Gas Limits, Oracle Manipulation & MEV",
    solidityVersion: "0.8.37",
    prerequisites: ["l5-low-level-calls-delegatecall"],
    level: 6,
    summary: "DoS by failing revert in loops, block gas limit exhaustion, spot price oracle manipulation, commit-reveal schemes, and MEV protection.",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/security-considerations.html",
    requiresPracticalExercise: true,
    requiresSecurityExplanation: true,
    securityTopics: ["DoS via Revert", "Unbounded Array Gas Exhaustion", "Oracle Price Manipulation", "Frontrunning"],
    relatedConcepts: ["Pull over Push Payments", "TWAP Oracles", "Commit-Reveal"],
    keyOmissionsToAvoid: ["Why push transfers can brick smart contracts if a recipient contract reverts on receive()"]
  }
];
