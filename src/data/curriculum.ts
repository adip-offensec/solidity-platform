export interface Lesson {
  id: string;
  level: number;
  title: string;
  subtitle: string;
  solidityVersion: string;
  officialDocUrl: string;
  coverageTopicId: string;
  prerequisites: string[];

  // Layered Explanations
  explanation: {
    beginner: string;
    developer: string;
    evm: string;
    security: string;
  };

  // Code Example
  initialCode: string;
  codeExplanation: {
    lineOrBlock: string;
    description: string;
  }[];

  // Diagrams / Flow
  executionFlowDiagram?: string[];

  // Quick Check Questions
  quickQuiz: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];

  // Common Mistakes & Best Practices
  commonMistakes: string[];
  bestPractices: string[];

  // Exercises linked
  exerciseId?: string;
}

export const CURRICULUM_LESSONS: Lesson[] = [
  // LEVEL 0 LESSON
  {
    id: "lesson-l0-blockchain-evm",
    level: 0,
    title: "Level 0: Blockchain, Ethereum & EVM Essentials",
    subtitle: "Understanding the decentralized machine before writing code",
    solidityVersion: "0.8.37",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/introduction-to-smart-contracts.html",
    coverageTopicId: "l0-blockchain-evm-basics",
    prerequisites: [],
    explanation: {
      beginner: "Imagine Ethereum as a single global computer that everyone in the world shares. Anyone can run code on it by sending a transaction, but once code (a 'smart contract') is placed on Ethereum, it stays there permanently and executes exactly as programmed without any middleman.",
      developer: "The Ethereum Virtual Machine (EVM) is a deterministic 256-bit stack-based state machine. Ethereum nodes process transactions that transition the world state from S to S'. Accounts come in two types: Externally Owned Accounts (EOAs controlled by private keys) and Contract Accounts (controlled by bytecode and persistent storage).",
      evm: "EVM executes bytecode opcodes sequentially. State changes are stored in a Merkle Patricia Trie. Modifying storage requires gas fees paid in Ether to incentivize validators and prevent infinite execution loops (halting problem solution).",
      security: "All data on Ethereum (including private variables in storage) is publicly visible to any node reading the blockchain. Do not store plain text passwords or secrets in smart contracts."
    },
    initialCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HelloWorld
 * @dev A minimal smart contract illustrating basic state and functions.
 */
contract HelloWorld {
    // Permanent storage variable on the Ethereum blockchain
    string public greeting = "Hello, Solidity Learner!";

    // Updates the state variable
    function setGreeting(string memory _newGreeting) public {
        greeting = _newGreeting;
    }
}`,
    codeExplanation: [
      { lineOrBlock: "pragma solidity ^0.8.20;", description: "Specifies that this file requires Solidity compiler version 0.8.20 or compatible newer versions." },
      { lineOrBlock: "contract HelloWorld { ... }", description: "Defines a contract unit, similar to a class in object-oriented programming." },
      { lineOrBlock: "string public greeting = ...", description: "A state variable saved permanently in blockchain storage. The `public` keyword automatically generates a getter function." },
      { lineOrBlock: "function setGreeting(...) public", description: "A state-modifying function. Executing this via a transaction updates the contract state on the blockchain and consumes gas." }
    ],
    executionFlowDiagram: [
      "User signs transaction to call setGreeting('Hello EVM')",
      "Transaction is broadcasted to Ethereum P2P Network",
      "Validator node picks up transaction & executes EVM bytecode",
      "SSTORE opcode updates contract storage slot 0 with new string pointer",
      "Gas is deducted from caller's account; transaction is included in a block"
    ],
    quickQuiz: [
      {
        id: "q0-1",
        question: "Is state variable data marked as 'private' hidden from external node observers on Ethereum?",
        options: [
          "Yes, private means encrypted on the blockchain.",
          "No, all blockchain state is publicly readable by inspecting storage slots.",
          "Yes, only contract functions can read private variables.",
          "No, but it costs gas to view private variables."
        ],
        correctIndex: 1,
        explanation: "The 'private' visibility keyword only restricts access from other Solidity contracts. Anyone running an Ethereum node can read raw storage slots from the blockchain state."
      }
    ],
    commonMistakes: [
      "Assuming private variables equal confidential or encrypted data.",
      "Expecting state-modifying function calls to return values directly to frontend web3 callers (transactions return transaction hashes, not return values!)."
    ],
    bestPractices: [
      "Always specify an explicit SPDX license identifier at the top of every file.",
      "Lock down pragma versions in production contracts to avoid unexpected compiler behavior changes."
    ],
    exerciseId: "ex-hello-world"
  },

  // LEVEL 1 LESSON
  {
    id: "lesson-l1-variables-types",
    level: 1,
    title: "Level 1: Variables, Data Types & Pragmas",
    subtitle: "Value types, constants, immutables, and pragma rules",
    solidityVersion: "0.8.37",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/types.html#value-types",
    coverageTopicId: "l1-value-types",
    prerequisites: ["lesson-l0-blockchain-evm"],
    explanation: {
      beginner: "Solidity is a statically-typed language. Every variable must have a type (like uint for positive numbers, address for account IDs, or bool for true/false). You can save gas by using `constant` or `immutable` for values that never change after deployment.",
      developer: "Value types are passed by value (copied when used as function arguments or assignments). Primitive value types include booleans (`bool`), signed/unsigned integers (`int8` to `int256`, `uint8` to `uint256` in increments of 8), addresses (`address` and `address payable`), and fixed-size byte arrays (`bytes1` to `bytes32`).",
      evm: "Value types occupy up to 32 bytes (1 EVM word). When variables smaller than 32 bytes (e.g., uint8) are declared consecutively in storage, the Solidity compiler packs them into single 32-byte storage slots to optimize SSTORE/SLOAD gas.",
      security: "Since Solidity 0.8.0, arithmetic operations check for overflow and underflow by default and automatically revert. Use `unchecked { ... }` blocks sparingly only when performance-critical and mathematically safe."
    },
    initialCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VariableExplorer {
    // Constants are replaced at compile time (0 gas cost for storage read)
    uint256 public constant MAX_SUPPLY = 10000;

    // Immutable variables are assigned ONCE in constructor and stored in code bytecode
    address public immutable owner;

    // Regular state variable (stored in EVM storage slot)
    uint256 public counter;
    bool public isActive = true;

    constructor() {
        owner = msg.sender;
    }

    function increment() public {
        counter += 1;
    }

    // Demonstrating unchecked arithmetic block
    function uncheckedIncrement(uint256 amount) public {
        unchecked {
            counter += amount;
        }
    }
}`,
    codeExplanation: [
      { lineOrBlock: "uint256 public constant MAX_SUPPLY = 10000;", description: "Value hardcoded into bytecode; costs zero storage SLOAD gas when accessed." },
      { lineOrBlock: "address public immutable owner;", description: "Assigned in constructor; burned directly into contract runtime bytecode upon deployment." },
      { lineOrBlock: "unchecked { counter += amount; }", description: "Bypasses Solidity 0.8+ default arithmetic overflow checks to save ~100 gas per operation." }
    ],
    executionFlowDiagram: [
      "Deployment: constructor assigns owner = msg.sender and bakes it into runtime bytecode",
      "Call increment(): counter read from Storage Slot 0 -> incremented -> written back to Slot 0"
    ],
    quickQuiz: [
      {
        id: "q1-1",
        question: "What is the primary gas advantage of using `constant` or `immutable` over normal state variables?",
        options: [
          "They can be updated without gas fees.",
          "They do not occupy expensive EVM storage slots; their values are embedded directly in runtime bytecode.",
          "They automatically encrypt state data on chain.",
          "They allow negative numbers in uint types."
        ],
        correctIndex: 1,
        explanation: "`constant` and `immutable` variables do not use EVM storage slots (SLOAD costs 100 to 2100 gas). Instead, their values are directly replaced in the bytecode during compilation or constructor execution."
      }
    ],
    commonMistakes: [
      "Using `msg.sender` in `constant` initializers (constants are computed at compile time, before `msg.sender` exists!).",
      "Unintentionally using `unchecked` arithmetic blocks on untrusted user inputs leading to integer overflow vulnerabilities."
    ],
    bestPractices: [
      "Mark state variables that never change as `constant` or `immutable`.",
      "Use `uint256` by default unless optimizing storage layout slot packing in state variables."
    ],
    exerciseId: "ex-variables-types"
  },

  // LEVEL 2 LESSON
  {
    id: "lesson-l2-structs-mappings-errors",
    level: 2,
    title: "Level 2: Mappings, Structs & Custom Errors",
    subtitle: "Data structures, hash maps, and gas-efficient error handling",
    solidityVersion: "0.8.37",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/types.html#mapping-types",
    coverageTopicId: "l2-structs-enums-mappings",
    prerequisites: ["lesson-l1-variables-types"],
    explanation: {
      beginner: "Mappings are like key-value lookup tables (dictionaries). You can look up a user's balance with `balances[userAddress]`. Unlike array lists, mappings don't store a list of keys, so you cannot iterate over them directly.",
      developer: "Mappings are declared as `mapping(KeyType => ValueType)`. Custom errors (`error InsufficientBalance(uint256 available, uint256 required);`) provide significant gas savings over traditional string revert messages like `require(balance >= amount, \"Insufficient balance\")` because they compile down to 4-byte custom error selectors.",
      evm: "A mapping does not store keys or length. The storage location for `mapping[key]` at slot `p` is calculated as `keccak256(h(key) . p)`. Unset mapping keys return the default zero value (0, false, address(0)) without throwing errors.",
      security: "Always check key conditions before state modifications. Because accessing an uninitialized mapping key returns 0 instead of reverting, failure to validate key existence can lead to authorization bypasses."
    },
    initialCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Vault {
    struct Deposit {
        uint128 amount;
        uint128 timestamp;
    }

    // Custom Error definition (saves ~500-1000 gas compared to require with long string)
    error InsufficientBalance(uint256 requested, uint256 available);
    error ZeroDepositNotAllowed();

    // Mapping from account address to user deposit struct
    mapping(address => Deposit) public deposits;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    function deposit() public payable {
        if (msg.value == 0) revert ZeroDepositNotAllowed();

        deposits[msg.sender].amount += uint128(msg.value);
        deposits[msg.sender].timestamp = uint128(block.timestamp);

        emit Deposited(msg.sender, msg.value);
    }

    function withdraw(uint256 _amount) public {
        uint256 currentBalance = deposits[msg.sender].amount;
        if (_amount > currentBalance) {
            revert InsufficientBalance({requested: _amount, available: currentBalance});
        }

        deposits[msg.sender].amount -= uint128(_amount);

        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, _amount);
    }
}`,
    codeExplanation: [
      { lineOrBlock: "error InsufficientBalance(uint256 requested, uint256 available);", description: "Defines a custom error with parameters. Emits a 4-byte signature when reverted." },
      { lineOrBlock: "mapping(address => Deposit) public deposits;", description: "Hash map storing user deposits indexed by address." },
      { lineOrBlock: "revert InsufficientBalance(...);", description: "Reverts transaction state modifications and returns the custom error selector to caller." }
    ],
    executionFlowDiagram: [
      "User calls withdraw(100)",
      "Check: _amount > deposits[msg.sender].amount?",
      "If True: revert with 4-byte selector of InsufficientBalance(100, balance)",
      "If False: deduct amount -> transfer Ether via call{value: _amount}(\"\") -> emit Withdrawn event"
    ],
    quickQuiz: [
      {
        id: "q2-1",
        question: "What happens when you read a key from a mapping that has never been written to in Solidity?",
        options: [
          "The transaction immediately reverts with a KeyError.",
          "It returns null or undefined.",
          "It returns the default zero-value for the value type (e.g., 0 for uint, false for bool).",
          "It allocates a new slot in storage automatically."
        ],
        correctIndex: 2,
        explanation: "Mappings in Solidity do not store key metadata. Querying an unassigned key returns the default zero value of the value type without reverting."
      }
    ],
    commonMistakes: [
      "Attempting to iterate over a mapping using a for loop or get length with `.length` (mappings have no key list or length property).",
      "Using string `require()` error messages instead of custom errors in gas-sensitive production code."
    ],
    bestPractices: [
      "Use custom errors instead of `require(condition, 'long string message')` to save deploy and runtime gas.",
      "Pack struct members where possible (e.g. two `uint128` fit into a single 32-byte storage slot)."
    ],
    exerciseId: "ex-mappings-structs"
  },

  // LEVEL 4 LESSON — DATA LOCATIONS
  {
    id: "lesson-l4-data-locations-evm",
    level: 4,
    title: "Level 4: Storage, Memory, Calldata & Storage Packing",
    subtitle: "Mastering EVM data locations and memory layout internals",
    solidityVersion: "0.8.37",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/internals/layout_in_storage.html",
    coverageTopicId: "l4-storage-memory-calldata",
    prerequisites: ["lesson-l2-structs-mappings-errors"],
    explanation: {
      beginner: "In Solidity, complex data (like strings, arrays, and structs) must specify where they live: Storage (permanent memory on the blockchain), Memory (temporary memory created during function execution), or Calldata (temporary read-only buffer containing input parameters).",
      developer: "`storage` variables act as references pointing directly to persistent contract state. `memory` variables create fresh mutable copies in RAM that disappear when the function finishes. `calldata` is a non-modifiable, non-allocated byte array passed by the caller, which is the cheapest option for external function arguments.",
      evm: "EVM storage consists of 2^256 slots of 32 bytes each. Elementary types are packed sequentially from slot 0. If multiple items fit in 32 bytes, they share a slot (right-aligned in big-endian order). EVM memory expands dynamically; memory expansion cost scales quadratically past 512 bytes.",
      security: "Assigning a `storage` pointer to a local variable creates a reference to state. Accidental modifications to local storage pointer variables directly overwrite storage slots on chain!"
    },
    initialCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DataLocationMaster {
    struct User {
        string name;
        uint256 score;
    }

    // Storage slot 0: users mapping
    mapping(address => User) public users;

    // Slot packing example: slot 1 holds both val1 and val2 (16 bytes + 16 bytes = 32 bytes)
    uint128 public val1 = 100;
    uint128 public val2 = 200;

    function setUser(string calldata _name, uint256 _score) external {
        // _name is read directly from calldata without copying to memory (gas efficient!)
        users[msg.sender] = User({name: _name, score: _score});
    }

    function updateScoreMemory(uint256 _newScore) public view returns (User memory) {
        // Creates a COPY in temporary EVM memory. Storage on chain is NOT updated!
        User memory tempUser = users[msg.sender];
        tempUser.score = _newScore;
        return tempUser;
    }

    function updateScoreStorage(uint256 _newScore) public {
        // Creates a REFERENCE to storage slot. Directly modifies chain state!
        User storage userRef = users[msg.sender];
        userRef.score = _newScore;
    }
}`,
    codeExplanation: [
      { lineOrBlock: "string calldata _name", description: "Reads input directly from caller payload without allocating temporary EVM memory." },
      { lineOrBlock: "User memory tempUser = users[msg.sender];", description: "Copies data from storage into EVM memory. Modifying `tempUser` has NO effect on storage." },
      { lineOrBlock: "User storage userRef = users[msg.sender];", description: "Creates a pointer to storage. Modifying `userRef.score` executes SSTORE and mutates state on chain." }
    ],
    executionFlowDiagram: [
      "Storage: Permanent 2^256 x 32-byte slots (SSTORE / SLOAD)",
      "Memory: Dynamic byte array, cleared after call, quadratic expansion gas fee",
      "Calldata: Read-only transaction execution payload (CALLDATALOAD / CALLDATACOPY)"
    ],
    quickQuiz: [
      {
        id: "q4-1",
        question: "Why is `calldata` preferred over `memory` for input arguments in `external` functions?",
        options: [
          "Calldata allows writing back to caller variables.",
          "Calldata avoids copying parameters into EVM memory, saving gas.",
          "Calldata encrypts function inputs.",
          "Calldata can store unlimited size dynamic data for free."
        ],
        correctIndex: 1,
        explanation: "For `external` functions, `calldata` parameters read directly from the transaction execution payload buffer without spending gas to allocate memory copies."
      }
    ],
    commonMistakes: [
      "Thinking `memory` variable modifications will automatically save to blockchain storage.",
      "Declaring storage variables of different sizes non-consecutively, missing slot packing gas optimization (e.g. uint128, uint256, uint128 uses 3 slots instead of 2)."
    ],
    bestPractices: [
      "Use `calldata` for array/string/struct inputs in `external` functions.",
      "Group variables smaller than 32 bytes (uint128, uint8, address) adjacent to each other in storage declarations to pack them into single 32-byte slots."
    ],
    exerciseId: "ex-data-locations"
  },

  // LEVEL 5 LESSON — DELEGATECALL & LOW-LEVEL CALLS
  {
    id: "lesson-l5-low-level-calls-delegatecall",
    level: 5,
    title: "Level 5: External Calls, Call vs Delegatecall & Security",
    subtitle: "Understanding context execution, proxy patterns, and low-level call risks",
    solidityVersion: "0.8.37",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/introduction-to-smart-contracts.html#delegatecall-callcode-and-libraries",
    coverageTopicId: "l5-low-level-calls-delegatecall",
    prerequisites: ["lesson-l4-data-locations-evm"],
    explanation: {
      beginner: "Smart contracts can call other smart contracts. A standard `.call()` executes code on the target contract using the target contract's storage and Ether balance. A `.delegatecall()` executes the target contract's code, but uses the CALLER contract's storage, balance, and msg.sender!",
      developer: "`delegatecall` is the foundation of upgradeable proxy contracts and libraries. When Contract A delegatecalls Contract B, Contract B's code runs in Contract A's context (`address(this)` is Contract A, `msg.sender` remains original caller, storage target is Contract A).",
      evm: "In EVM assembly, DELEGATECALL (opcode 0xF4) preserves current caller context (caller, value, storage environment). However, storage updates in target code write to the caller contract's corresponding storage slots based on slot index numbers.",
      security: "If the caller contract and target contract have mismatched storage slot layouts, a delegatecall will corrupt storage slots (Storage Collision attack)! Never delegatecall to untrusted or user-supplied target addresses."
    },
    initialCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Implementation Contract (Logic)
contract LogicContract {
    // Slot 0 MUST match Proxy contract storage layout!
    uint256 public count;
    address public sender;

    function setScore(uint256 _count) public {
        count = _count;
        sender = msg.sender;
    }
}

// Caller / Proxy Contract
contract ProxyCaller {
    // Slot 0 matches LogicContract Slot 0
    uint256 public count;
    address public sender;

    function executeDelegateCall(address _logicAddress, uint256 _count) public returns (bool) {
        // Encodes function selector and argument: setScore(_count)
        bytes memory payload = abi.encodeWithSignature("setScore(uint256)", _count);

        // Executes LogicContract code in ProxyCaller storage context!
        (bool success, ) = _logicAddress.delegatecall(payload);
        return success;
    }
}`,
    codeExplanation: [
      { lineOrBlock: "abi.encodeWithSignature(\"setScore(uint256)\", _count)", description: "Computes 4-byte selector bytes4(keccak256(\"setScore(uint256)\")) and appends ABI encoded arguments." },
      { lineOrBlock: "_logicAddress.delegatecall(payload);", description: "Executes setScore code on LogicContract, but mutates ProxyCaller's `count` and `sender` storage slots!" }
    ],
    executionFlowDiagram: [
      "User calls ProxyCaller.executeDelegateCall(Logic, 42)",
      "DELEGATECALL opcode executes Logic.setScore(42)",
      "Logic code writes 42 to Slot 0 and msg.sender to Slot 1",
      "Slot 0 and Slot 1 of PROXY CALLER are updated! Logic contract storage remains untouched."
    ],
    quickQuiz: [
      {
        id: "q5-1",
        question: "When Contract A performs a `delegatecall` to Contract B, whose storage is modified?",
        options: [
          "Contract B's storage is modified.",
          "Contract A's storage is modified.",
          "Both Contract A and Contract B storage are modified.",
          "Neither; delegatecall is read-only."
        ],
        correctIndex: 1,
        explanation: "`delegatecall` executes code from Contract B inside Contract A's context, modifying Contract A's storage slots."
      }
    ],
    commonMistakes: [
      "Mismatched state variable ordering between proxy and implementation contracts causing storage collisions.",
      "Failing to check return success boolean on low-level calls (`(bool success, ) = target.call(...)`)."
    ],
    bestPractices: [
      "Always check return booleans of low-level calls.",
      "Use established proxy standards like ERC-1967 (UUPS/Transparent) to avoid storage slot collisions."
    ],
    exerciseId: "ex-delegatecall-proxy"
  },

  // SECURITY MODULE LESSON
  {
    id: "lesson-sec-reentrancy",
    level: 5,
    title: "Security Lab: Reentrancy Attacks & CEI Pattern",
    subtitle: "Analyzing vulnerable code, exploit mechanics, and defense strategies",
    solidityVersion: "0.8.37",
    officialDocUrl: "https://docs.soliditylang.org/en/v0.8.37/security-considerations.html#re-entrancy",
    coverageTopicId: "sec-reentrancy-vulnerabilities",
    prerequisites: ["lesson-l5-low-level-calls-delegatecall"],
    explanation: {
      beginner: "A reentrancy attack occurs when a vulnerable contract sends Ether to an external address before updating its internal balance records. The attacker's contract uses its fallback function to call back (re-enter) the withdrawal function repeatedly, draining all funds before the initial balance check updates!",
      developer: "Reentrancy breaks contract assumptions when state changes happen AFTER external calls (violating the Checks-Effects-Interactions pattern). Reentrancy can be Single-function, Cross-function, or Read-only (where view functions read stale uncommitted state during an external call).",
      evm: "When `.call{value: x}(\"\")` transfers control to an external contract, EVM passes remaining gas to target. The target executes its `receive()` or `fallback()` opcode routine and invokes a fresh CALL opcode back to the target contract.",
      security: "Always follow Checks-Effects-Interactions (CEI): 1) Checks: Validate requirements, 2) Effects: Update contract storage state, 3) Interactions: Make external calls / send Ether. Supplement with nonReentrant mutex modifier guards."
    },
    initialCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// VULNERABLE VAULT CONTRACT
contract VulnerableVault {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    // VULNERABLE TO REENTRANCY ATTACK!
    function withdraw() public {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "No balance");

        // 1. INTERACTION BEFORE EFFECT! Sends Ether to caller
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");

        // 2. EFFECT (State update occurs AFTER external call!)
        balances[msg.sender] = 0;
    }
}

// FIXED SECURE VAULT CONTRACT USING CEI PATTERN
contract SecureVault {
    mapping(address => uint256) public balances;
    bool private locked;

    modifier nonReentrant() {
        require(!locked, "ReentrancyGuard: reentrant call");
        locked = true;
        _;
        locked = false;
    }

    function withdraw() public nonReentrant {
        uint256 bal = balances[msg.sender];
        require(bal > 0, "No balance");

        // 1. EFFECT FIRST! Update balance state BEFORE sending Ether
        balances[msg.sender] = 0;

        // 2. INTERACTION AFTER EFFECT!
        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");
    }
}`,
    codeExplanation: [
      { lineOrBlock: "msg.sender.call{value: bal}(\"\");", description: "Transfers execution control and remaining gas to receiver fallback function BEFORE updating balances mapping." },
      { lineOrBlock: "balances[msg.sender] = 0;", description: "In the secure version, balance is zeroed OUT BEFORE the external call occurs, blocking reentrant draining." },
      { lineOrBlock: "modifier nonReentrant() { ... }", description: "Mutex lock preventing recursive re-entry into any function protected by this modifier." }
    ],
    executionFlowDiagram: [
      "Attacker calls VulnerableVault.withdraw()",
      "VulnerableVault sends Ether -> Attacker fallback() triggers",
      "Attacker fallback() calls VulnerableVault.withdraw() AGAIN",
      "balances[msg.sender] is STILL > 0 because step 2 hasn't executed!",
      "VulnerableVault sends Ether AGAIN -> Vault is drained completely."
    ],
    quickQuiz: [
      {
        id: "qsec-1",
        question: "What is the core rule of the Checks-Effects-Interactions (CEI) design pattern?",
        options: [
          "Perform external interactions first before updating state.",
          "Update all internal state variables (Effects) BEFORE calling external contracts (Interactions).",
          "Never send Ether using low-level calls.",
          "Use require statements after every function execution."
        ],
        correctIndex: 1,
        explanation: "CEI dictates updating all internal contract state (Effects) prior to transferring control or sending Ether to external accounts (Interactions)."
      }
    ],
    commonMistakes: [
      "Placing state variable updates after external `.call()` transfers.",
      "Assuming view functions are immune to reentrancy (read-only reentrancy can corrupt price oracles)."
    ],
    bestPractices: [
      "Strictly enforce the Checks-Effects-Interactions (CEI) sequence.",
      "Apply OpenZeppelin ReentrancyGuard mutex locks on functions handling Ether/token transfers."
    ],
    exerciseId: "ex-security-reentrancy"
  }
];
