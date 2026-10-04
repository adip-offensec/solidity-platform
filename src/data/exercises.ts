export type ExerciseType =
  | "predict-output"
  | "find-bug"
  | "fix-code"
  | "complete-code"
  | "build-from-scratch"
  | "security-challenge";

export interface Exercise {
  id: string;
  lessonId: string;
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  type: ExerciseType;
  prompt: string;
  solidityVersion: string;

  // Starting code in IDE
  initialCode: string;

  // Expected validation logic
  solutionCode: string;
  expectedStateOrOutput?: string;

  // Validation function test criteria
  testCases: {
    name: string;
    description: string;
    functionToCall?: string;
    args?: any[];
    expectedReturn?: any;
    expectedEvent?: string;
    shouldRevert?: boolean;
  }[];

  // Progressive 3-Tier Hint System
  hints: {
    tier1Conceptual: string;
    tier2Specific: string;
    tier3FeaturePoint: string;
  };

  explanationOnComplete: string;
}

export const PRACTICAL_EXERCISES: Exercise[] = [
  {
    id: "ex-hello-world",
    lessonId: "lesson-l0-blockchain-evm",
    title: "Exercise: Build & Deploy Your First Contract",
    difficulty: "Beginner",
    type: "complete-code",
    prompt: "Complete the `GreetingVault` contract. Define a public state variable `greeting` initialized to 'Solidity is Great', and write a function `updateGreeting(string memory _newGreeting)` that allows updating it.",
    solidityVersion: "0.8.20",
    initialCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GreetingVault {
    // 1. Declare a public string state variable named 'greeting'
    // Initialize it with "Solidity is Great"

    // 2. Write a function named 'updateGreeting' that takes a string memory parameter
    // and updates the 'greeting' state variable.
}`,
    solutionCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GreetingVault {
    string public greeting = "Solidity is Great";

    function updateGreeting(string memory _newGreeting) public {
        greeting = _newGreeting;
    }
}`,
    testCases: [
      {
        name: "Initial Greeting Check",
        description: "The contract should initialize greeting to 'Solidity is Great'",
        functionToCall: "greeting",
        expectedReturn: "Solidity is Great"
      },
      {
        name: "Update Greeting",
        description: "Calling updateGreeting('Mastering EVM') should update greeting state variable",
        functionToCall: "updateGreeting",
        args: ["Mastering EVM"]
      },
      {
        name: "Verify Updated Greeting",
        description: "greeting state variable should now equal 'Mastering EVM'",
        functionToCall: "greeting",
        expectedReturn: "Mastering EVM"
      }
    ],
    hints: {
      tier1Conceptual: "State variables exist outside functions inside contract scope. They are stored permanently in blockchain storage.",
      tier2Specific: "Use the `public` modifier on `string public greeting` so Solidity automatically generates a reader function for it.",
      tier3FeaturePoint: "Your function signature should be `function updateGreeting(string memory _newGreeting) public` and inside assign `greeting = _newGreeting;`."
    },
    explanationOnComplete: "Awesome! You built a contract with state persistence. Notice how calling `greeting()` is free (view read), but calling `updateGreeting()` modifies storage state and consumes gas."
  },

  {
    id: "ex-variables-types",
    lessonId: "lesson-l1-variables-types",
    title: "Exercise: Gas Optimization with Immutable & Constant",
    difficulty: "Beginner",
    type: "fix-code",
    prompt: "The `TokenInfo` contract uses standard expensive storage state variables for values that never change! Fix the code by converting `FEE_PERCENT` to a `constant` and `deployer` to an `immutable` address set in the constructor.",
    solidityVersion: "0.8.20",
    initialCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TokenInfo {
    // FIX THIS: Convert to constant
    uint256 public FEE_PERCENT = 5;

    // FIX THIS: Convert to immutable (assigned in constructor)
    address public deployer;

    constructor() {
        deployer = msg.sender;
    }
}`,
    solutionCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TokenInfo {
    uint256 public constant FEE_PERCENT = 5;
    address public immutable deployer;

    constructor() {
        deployer = msg.sender;
    }
}`,
    testCases: [
      {
        name: "Constant Fee Check",
        description: "FEE_PERCENT should equal 5 and be a constant",
        functionToCall: "FEE_PERCENT",
        expectedReturn: "5"
      },
      {
        name: "Deployer Address Check",
        description: "deployer immutable should equal deployer address",
        functionToCall: "deployer"
      }
    ],
    hints: {
      tier1Conceptual: "Constants must be assigned directly at declaration time. Immutables can be declared without value and assigned once inside constructor.",
      tier2Specific: "Add `constant` between type and visibility for FEE_PERCENT: `uint256 public constant FEE_PERCENT = 5;`",
      tier3FeaturePoint: "Add `immutable` for deployer: `address public immutable deployer;` and assign `deployer = msg.sender;` in constructor."
    },
    explanationOnComplete: "By converting state variables to constant and immutable, you eliminated expensive SLOAD storage reads (~2100 gas saved per call!). The values are now baked directly into contract bytecode."
  },

  {
    id: "ex-mappings-structs",
    lessonId: "lesson-l2-structs-mappings-errors",
    title: "Exercise: Bank Vault with Custom Errors",
    difficulty: "Intermediate",
    type: "build-from-scratch",
    prompt: "Build a `BankVault` contract with a custom error `Unauthorized()`. Create a mapping `balances` mapping address to uint256. Add a function `deposit()` payable that adds `msg.value` to caller balance. Add a function `withdraw(uint256 amount)` that checks balance, updates balance first, and sends Ether.",
    solidityVersion: "0.8.20",
    initialCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BankVault {
    // Define custom error Unauthorized()
    // Define mapping balances

    // Define function deposit() public payable

    // Define function withdraw(uint256 amount) public
}`,
    solutionCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BankVault {
    error InsufficientFunds();

    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw(uint256 amount) public {
        if (balances[msg.sender] < amount) {
            revert InsufficientFunds();
        }

        balances[msg.sender] -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }
}`,
    testCases: [
      {
        name: "Deposit funds",
        description: "Calling deposit with 1 ether updates balance",
        functionToCall: "deposit",
        args: []
      },
      {
        name: "Withdraw funds",
        description: "Calling withdraw reduces balance",
        functionToCall: "withdraw",
        args: ["1000"]
      }
    ],
    hints: {
      tier1Conceptual: "Remember to use the `payable` modifier on `deposit()` to allow the contract to receive Ether via `msg.value`.",
      tier2Specific: "Use custom error `if (balances[msg.sender] < amount) revert InsufficientFunds();` before sending Ether.",
      tier3FeaturePoint: "Always update balance (`balances[msg.sender] -= amount`) BEFORE doing external call `payable(msg.sender).call{value: amount}(\"\")` to follow Checks-Effects-Interactions."
    },
    explanationOnComplete: "Great job! You implemented custom errors for gas efficiency, managed address mapping state, and safely transferred Ether."
  },

  {
    id: "ex-security-reentrancy",
    lessonId: "lesson-sec-reentrancy",
    title: "Security Challenge: Fix the Reentrancy Vulnerability",
    difficulty: "Advanced",
    type: "security-challenge",
    prompt: "The `InsecureBank` contract is vulnerable to a reentrancy attack! Refactor the `withdraw()` function to adhere strictly to the Checks-Effects-Interactions (CEI) pattern.",
    solidityVersion: "0.8.20",
    initialCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract InsecureBank {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    // FIX THIS VULNERABLE FUNCTION
    function withdraw() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");

        // VULNERABLE: External call before state update!
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed");

        balances[msg.sender] = 0;
    }
}`,
    solutionCode: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract InsecureBank {
    mapping(address => uint256) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint256 amount = balances[msg.sender];
        require(amount > 0, "No balance");

        // FIX: Effect (State modification) BEFORE Interaction (External Call)
        balances[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Failed");
    }
}`,
    testCases: [
      {
        name: "Withdrawal Checks-Effects-Interactions order",
        description: "Zero out balances[msg.sender] prior to executing external call",
        functionToCall: "withdraw"
      }
    ],
    hints: {
      tier1Conceptual: "Identify the order of operations: Checks (requirements) -> Effects (state updates) -> Interactions (external calls/Ether transfers).",
      tier2Specific: "Look at `balances[msg.sender] = 0;` and move it above the `msg.sender.call` line.",
      tier3FeaturePoint: "By zeroing the user balance BEFORE sending Ether, any reentrant callback attempt to `withdraw()` will see a balance of 0 and revert on `require(amount > 0)`."
    },
    explanationOnComplete: "Security vulnerability fixed! By zeroing the caller balance before making the external call, reentrant callbacks find `balances[msg.sender]` equal to 0 and fail the initial check."
  }
];
