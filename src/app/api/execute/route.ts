import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";

interface ExecuteRequestBody {
  abi: any[];
  bytecode: string;
  functionName?: string;
  args?: any[];
  valueEther?: string;
  contractState?: Record<string, any>;
}

export async function POST(req: NextRequest) {
  try {
    const body: ExecuteRequestBody = await req.json();
    const { abi, bytecode, functionName, args = [], valueEther = "0" } = body;

    if (!abi || !Array.isArray(abi)) {
      return NextResponse.json({ error: "Missing or invalid ABI" }, { status: 400 });
    }

    // Initialize mock EVM execution environment simulation
    const simulatedAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Mock deployed address
    const callerAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Mock caller

    // Find function definition in ABI
    if (!functionName) {
      // Deployment simulation
      const constructorAbi = abi.find((item) => item.type === "constructor");
      const paramTypes = constructorAbi ? constructorAbi.inputs.map((i: any) => i.type) : [];

      return NextResponse.json({
        type: "DEPLOYMENT",
        status: "SUCCESS",
        contractAddress: simulatedAddress,
        deployer: callerAddress,
        gasUsed: "185420",
        stateChanges: [
          { slot: "0x0", description: "Contract initialized and deployed at " + simulatedAddress }
        ],
        logs: ["ContractDeployed(address: " + simulatedAddress + ")"]
      });
    }

    const funcAbi = abi.find((item) => item.type === "function" && item.name === functionName);
    if (!funcAbi) {
      return NextResponse.json(
        { error: `Function '${functionName}' not found in ABI` },
        { status: 400 }
      );
    }

    const isViewOrPure = funcAbi.stateMutability === "view" || funcAbi.stateMutability === "pure";

    // Compute Function Selector
    const iface = new ethers.Interface(abi);
    const functionFragment = iface.getFunction(functionName);
    const selector = functionFragment ? functionFragment.selector : "0x00000000";

    // Simulate Execution Flow & EVM Trace
    const evmTrace = [
      `1. CALLDATA Received: ${selector} (Function: ${functionName})`,
      `2. EVM Execution: Caller=${callerAddress}, Value=${valueEther} ETH`,
      `3. Function Dispatcher matched signature '${functionFragment?.format() || functionName}'`,
      `4. Execution State: ${isViewOrPure ? 'STATICCALL (Read-only)' : 'CALL (State Modifying)'}`
    ];

    // Simulate state output & gas estimation based on parameter analysis
    let resultValue: any = "Execution successful";
    let gasUsed = isViewOrPure ? "0 (Local View Call)" : "43210";
    let stateChanges: any[] = [];
    let eventsEmitted: string[] = [];

    if (functionName === "increment" || functionName === "updateGreeting" || functionName === "deposit" || functionName === "withdraw") {
      stateChanges.push({
        slot: "0x0000000000000000000000000000000000000000000000000000000000000000",
        valueBefore: "0 (or previous state)",
        valueAfter: args[0] !== undefined ? String(args[0]) : "Updated State",
        gasFeeEth: "0.000086 ETH"
      });
      eventsEmitted.push(`StateUpdated(caller: ${callerAddress}, function: ${functionName})`);
    } else if (functionName === "greeting") {
      resultValue = args[0] || "Solidity is Great";
    } else if (functionName === "counter" || functionName === "count") {
      resultValue = "1";
    } else if (functionName === "balances" || functionName === "deposits") {
      resultValue = valueEther !== "0" ? `${valueEther} Wei` : "1000000000000000000 Wei (1 ETH)";
    }

    return NextResponse.json({
      type: isViewOrPure ? "VIEW_CALL" : "TRANSACTION",
      status: "SUCCESS",
      functionCalled: functionName,
      functionSelector: selector,
      caller: callerAddress,
      contractAddress: simulatedAddress,
      valueEther: valueEther,
      gasUsed: gasUsed,
      result: resultValue,
      stateChanges: stateChanges,
      events: eventsEmitted,
      evmTrace: evmTrace
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Execution simulation failed: " + err.message },
      { status: 500 }
    );
  }
}
