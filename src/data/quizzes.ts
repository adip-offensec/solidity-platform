export interface QuizQuestion {
  id: string;
  topicId: string;
  lessonId: string;
  question: string;
  codeSnippet?: string;
  options: {
    id: string;
    text: string;
    explanation: string;
  }[];
  correctOptionId: string;
  level: number;
}

export const QUIZ_DATABASE: QuizQuestion[] = [
  {
    id: "quiz-l0-1",
    topicId: "l0-blockchain-evm-basics",
    lessonId: "lesson-l0-blockchain-evm",
    question: "Why does updating a state variable in Solidity cost gas, whereas reading a public variable from outside a transaction is free?",
    options: [
      {
        id: "a",
        text: "State variables are stored in EVM memory, which requires validator signature fees.",
        explanation: "Incorrect. State variables are stored in permanent blockchain Storage (SSTORE/SLOAD), not temporary Memory."
      },
      {
        id: "b",
        text: "Modifying storage requires nodes to permanently record data and execute state transitions (SSTORE), whereas external reads (view calls) are executed locally by a single node without blockchain consensus.",
        explanation: "Correct! Modifying storage requires consensus across all validator nodes via transactions (SSTORE opcode costs ~20,000 gas). View calls execute locally on one node for free."
      },
      {
        id: "c",
        text: "Reading variables requires gas only when using Ethereum mainnet.",
        explanation: "Incorrect. Reading state locally without a transaction costs 0 gas on any network."
      }
    ],
    correctOptionId: "b",
    level: 0
  },
  {
    id: "quiz-l1-1",
    topicId: "l1-value-types",
    lessonId: "lesson-l1-variables-types",
    question: "What happens in Solidity version 0.8.0 and above when a `uint8` counter at value 255 is incremented by 1 without an `unchecked` block?",
    options: [
      {
        id: "a",
        text: "It silently wraps around to 0 (classic integer overflow).",
        explanation: "Incorrect. Wrapping around was standard in Solidity <=0.7.x, but in 0.8.0+ arithmetic operations overflow check by default."
      },
      {
        id: "b",
        text: "The transaction reverts automatically with an Arithmetic Overflow/Underflow panic error.",
        explanation: "Correct! Solidity 0.8.0 introduced default compiler checks that revert transactions on overflow/underflow."
      },
      {
        id: "c",
        text: "The counter automatically converts to uint256 type.",
        explanation: "Incorrect. Variable types in Solidity are statically defined and never automatically change size at runtime."
      }
    ],
    correctOptionId: "b",
    level: 1
  },
  {
    id: "quiz-l4-1",
    topicId: "l4-storage-memory-calldata",
    lessonId: "lesson-l4-data-locations-evm",
    question: "Consider this function argument: `function processItems(uint256[] calldata items) external`. What makes `calldata` more gas efficient than `memory` here?",
    options: [
      {
        id: "a",
        text: "Calldata stores array items inside storage slot 0.",
        explanation: "Incorrect. Calldata is the execution input payload buffer, completely separate from contract storage slots."
      },
      {
        id: "b",
        text: "Calldata reads array elements directly from the immutable transaction payload buffer without spending gas to allocate new dynamic RAM copies.",
        explanation: "Correct! Calldata parameters avoid dynamic memory expansion and allocation costs."
      },
      {
        id: "c",
        text: "Calldata allows modifying input array elements in place.",
        explanation: "Incorrect. Calldata is strictly read-only."
      }
    ],
    correctOptionId: "b",
    level: 4
  }
];
