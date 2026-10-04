import { NextRequest, NextResponse } from "next/server";
import solc from "solc";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sources, optimizer = true, runs = 200 } = body;

    if (!sources || typeof sources !== "object") {
      return NextResponse.json(
        { error: "Invalid source files provided. 'sources' must be an object of filename -> content." },
        { status: 400 }
      );
    }

    // Format sources for solc Standard JSON Input
    const formattedSources: Record<string, { content: string }> = {};
    for (const [filename, content] of Object.entries(sources)) {
      formattedSources[filename] = {
        content: typeof content === "string" ? content : (content as any).content || ""
      };
    }

    const input = {
      language: "Solidity",
      sources: formattedSources,
      settings: {
        optimizer: {
          enabled: optimizer,
          runs: runs
        },
        outputSelection: {
          "*": {
            "*": [
              "abi",
              "evm.bytecode",
              "evm.deployedBytecode",
              "evm.methodIdentifiers",
              "evm.gasEstimates",
              "storageLayout"
            ],
            "": ["ast"]
          }
        }
      }
    };

    const outputJson = JSON.parse(solc.compile(JSON.stringify(input)));

    // Parse errors and warnings
    const errors = outputJson.errors || [];
    const formattedErrors = errors.map((err: any) => ({
      severity: err.severity, // 'error' or 'warning'
      formattedMessage: err.formattedMessage,
      message: err.message,
      type: err.type,
      sourceLocation: err.sourceLocation
    }));

    const hasCompilationError = errors.some((e: any) => e.severity === "error");

    // Extract compiled contracts
    const contracts: Record<string, any> = {};
    if (outputJson.contracts) {
      for (const [fileName, fileContracts] of Object.entries(outputJson.contracts)) {
        for (const [contractName, contractData] of Object.entries(fileContracts as any)) {
          contracts[contractName] = {
            fileName,
            contractName,
            abi: (contractData as any).abi,
            bytecode: (contractData as any).evm?.bytecode?.object || "",
            opcodes: (contractData as any).evm?.bytecode?.opcodes || "",
            functionSelectors: (contractData as any).evm?.methodIdentifiers || {},
            gasEstimates: (contractData as any).evm?.gasEstimates || {},
            storageLayout: (contractData as any).storageLayout || null
          };
        }
      }
    }

    return NextResponse.json({
      success: !hasCompilationError,
      solcVersion: solc.version(),
      contracts,
      diagnostics: formattedErrors
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal compilation error: " + err.message },
      { status: 500 }
    );
  }
}
