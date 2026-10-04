import { NextRequest, NextResponse } from "next/server";

interface AITutorRequestBody {
  prompt: string;
  action?: "EXPLAIN_CODE" | "DEBUG_ERROR" | "GIVE_HINT" | "SECURITY_AUDIT" | "GENERAL_QUESTION";
  code?: string;
  compilerDiagnostics?: any[];
  lessonTitle?: string;
  lessonLevel?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: AITutorRequestBody = await req.json();
    const { prompt, action = "GENERAL_QUESTION", code, compilerDiagnostics, lessonTitle, lessonLevel } = body;

    let systemContext = `You are Jules, an expert Solidity and EVM Security Tutor.
Current Context:
Lesson: ${lessonTitle || "General Practice"} (Level ${lessonLevel ?? "1"})
`;

    let responseMarkdown = "";

    if (action === "EXPLAIN_CODE" && code) {
      responseMarkdown = `### 🔍 Solidity Code Breakdown

Here is a step-by-step analysis of your smart contract:

#### 1. Contract Structure & Pragmas
\`\`\`solidity
${code.split('\n').slice(0, 4).join('\n')}
\`\`\`
- **Pragma directive**: Specifies the compiler version requirements.
- **License**: Identifies code licensing (e.g. \`SPDX-License-Identifier: MIT\`).

#### 2. EVM Execution & Data Flow
- **State Variables**: Any variable declared outside functions is stored in EVM **Storage** slots (256-bit slots).
- **Functions**: Functions marked \`public\` or \`external\` generate 4-byte function selectors derived from \`bytes4(keccak256("funcSignature"))\`.

#### 3. Gas & Security Overview
- Modifying state variables triggers \`SSTORE\` opcodes (~20,000 gas for uninitialized slots).
- Ensure function inputs adhere to proper visibility (\`calldata\` vs \`memory\`) to optimize memory expansion gas.`;
    } else if (action === "DEBUG_ERROR" && compilerDiagnostics && compilerDiagnostics.length > 0) {
      const firstError = compilerDiagnostics[0];
      responseMarkdown = `### ⚠️ Debugging Compiler Diagnostic

**Error Message:**
\`\`\`text
${firstError.formattedMessage || firstError.message || JSON.stringify(firstError)}
\`\`\`

#### 💡 Root Cause Analysis
This error typically occurs due to one of the following:
1. **Type Mismatch or Visibility Keyword**: In Solidity 0.8+, string and array parameter declarations require explicit data location (\`memory\` or \`calldata\`).
2. **Missing Pragma or Syntax Error**: Check for missing semicolons \`;\` or mismatched parentheses \`}\`.

#### 🛠️ Recommended Fix
Check line location mentioned in the diagnostic and ensure visibility keywords match EVM location rules.`;
    } else if (action === "GIVE_HINT") {
      responseMarkdown = `### 💡 Progressive Hint

1. **Conceptual Level**: Review the data location requirements (\`storage\` vs \`memory\` vs \`calldata\`).
2. **Implementation Pointer**: Remember that function parameters of reference types (arrays, strings, structs) in \`public\` functions must specify \`memory\` or \`calldata\`.
3. **Try this**: Update your function signature parameter keywords!`;
    } else if (action === "SECURITY_AUDIT" && code) {
      const containsReentrancy = code.includes(".call{value:") && !code.includes("nonReentrant");
      const containsTxOrigin = code.includes("tx.origin");

      responseMarkdown = `### 🛡️ Solidity Security Audit

I analyzed your contract code for potential vulnerabilities:

${containsReentrancy ? `⚠️ **HIGH RISK: Reentrancy Potential Detected!**
- You are making external call \`.call{value:...}("")\` to send Ether.
- **Remediation**: Follow Checks-Effects-Interactions (CEI). Update state balances *before* sending Ether, or apply a \`ReentrancyGuard\` modifier.
` : "✅ No obvious reentrancy call ordering issues found."}

${containsTxOrigin ? `⚠️ **MEDIUM RISK: \`tx.origin\` Authorization Used!**
- Do not use \`tx.origin\` for authorization. It is vulnerable to phishing attacks where a malicious intermediary forwards transactions.
- **Remediation**: Replace \`tx.origin\` with \`msg.sender\`.
` : "✅ Authorization checks avoid \`tx.origin\`."}

#### Best Practices Summary:
1. Lock compiler version in pragma.
2. Use Custom Errors instead of long string reverts to reduce bytecode size and runtime gas.
3. Validate user inputs with \`require\` or \`revert\` custom errors.`;
    } else {
      // General question response
      responseMarkdown = `### 🤖 AI Solidity Tutor Response

To answer your question: **"${prompt}"**

In Solidity v0.8.37:
1. **Language Rules**: Solidity is statically typed, compiled to EVM bytecode, and runs in the EVM sandbox.
2. **EVM Mechanics**: Everything boils down to EVM opcodes like \`SLOAD\`, \`SSTORE\`, \`MSTORE\`, and \`CALL\`.
3. **Security Perspective**: Always think like an attacker—what happens if an external call reverts, returns unexpected values, or re-enters your contract?

Let me know if you would like me to explain a specific line of code or generate a practice quiz!`;
    }

    return NextResponse.json({
      reply: responseMarkdown,
      actionTaken: action,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "AI Tutor service error: " + err.message },
      { status: 500 }
    );
  }
}
