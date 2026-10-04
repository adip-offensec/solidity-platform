"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Code2, AlertTriangle, Cpu, Layers, FileCode, CheckCircle, RefreshCw, Terminal, Sparkles } from "lucide-react";

interface SolidityIDEProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onAskAI?: (prompt: string, action: string, code: string) => void;
}

export function SolidityIDE({ initialCode, onCodeChange, onAskAI }: SolidityIDEProps) {
  const [code, setCode] = useState(
    initialCode ||
      `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Counter {
    uint256 public count;

    event Incremented(uint256 newCount);

    function increment() public {
        count += 1;
        emit Incremented(count);
    }

    function getCount() public view returns (uint256) {
        return count;
    }
}`
  );

  const [activeTab, setActiveTab] = useState<"compilation" | "execution" | "storage" | "evm">("compilation");
  const [isCompiling, setIsCompiling] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const [compileResult, setCompileResult] = useState<any>(null);
  const [executeResult, setExecuteResult] = useState<any>(null);
  const [selectedFunction, setSelectedFunction] = useState<string>("");
  const [functionArgs, setFunctionArgs] = useState<string>("");

  const handleEditorChange = (value: string | undefined) => {
    const updated = value || "";
    setCode(updated);
    if (onCodeChange) onCodeChange(updated);
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    setActiveTab("compilation");
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sources: { "Contract.sol": code }
        })
      });
      const data = await res.json();
      setCompileResult(data);

      // Set default function if compiled successfully
      if (data.success && data.contracts) {
        const contractName = Object.keys(data.contracts)[0];
        if (contractName && data.contracts[contractName].abi) {
          const funcs = data.contracts[contractName].abi.filter((i: any) => i.type === "function");
          if (funcs.length > 0) setSelectedFunction(funcs[0].name);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleExecute = async () => {
    if (!compileResult || !compileResult.contracts) {
      await handleCompile();
    }

    setIsExecuting(true);
    setActiveTab("execution");

    try {
      const contractName = compileResult?.contracts ? Object.keys(compileResult.contracts)[0] : "Counter";
      const contractData = compileResult?.contracts?.[contractName];

      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          abi: contractData?.abi || [],
          bytecode: contractData?.bytecode || "0x6080604052...",
          functionName: selectedFunction || "increment",
          args: functionArgs ? functionArgs.split(",").map((s) => s.trim()) : []
        })
      });
      const data = await res.json();
      setExecuteResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* IDE Header Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs text-indigo-400 font-mono bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-800/50">
            <FileCode className="w-3.5 h-3.5" />
            <span>Contract.sol</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">Solidity v0.8.20</span>
        </div>

        <div className="flex items-center space-x-2">
          {onAskAI && (
            <button
              onClick={() => onAskAI("Explain this code step-by-step", "EXPLAIN_CODE", code)}
              className="flex items-center space-x-1.5 text-xs font-medium bg-purple-900/40 text-purple-300 hover:bg-purple-900/70 border border-purple-700/50 px-3 py-1.5 rounded-lg transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Explain</span>
            </button>
          )}

          <button
            onClick={handleCompile}
            disabled={isCompiling}
            className="flex items-center space-x-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCompiling ? "animate-spin text-indigo-400" : ""}`} />
            <span>{isCompiling ? "Compiling..." : "Compile"}</span>
          </button>

          <button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex items-center space-x-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-lg shadow-md transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isExecuting ? "Executing..." : "Run / Execute"}</span>
          </button>
        </div>
      </div>

      {/* Editor & Console Split Window */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-[420px]">
        {/* Monaco Editor Component */}
        <div className="lg:col-span-7 border-r border-slate-800 bg-[#1e1e1e] flex flex-col">
          <Editor
            height="100%"
            defaultLanguage="solidity"
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              lineNumbersMinChars: 3
            }}
          />
        </div>

        {/* Interactive Output Console */}
        <div className="lg:col-span-5 bg-slate-950 flex flex-col font-mono text-xs">
          {/* Output Navigation Tabs */}
          <div className="flex border-b border-slate-800 bg-slate-900/80">
            <button
              onClick={() => setActiveTab("compilation")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 border-b-2 text-xs font-medium transition ${
                activeTab === "compilation"
                  ? "border-indigo-500 text-indigo-400 bg-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Compiler</span>
            </button>
            <button
              onClick={() => setActiveTab("execution")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 border-b-2 text-xs font-medium transition ${
                activeTab === "execution"
                  ? "border-indigo-500 text-indigo-400 bg-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Execution</span>
            </button>
            <button
              onClick={() => setActiveTab("storage")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 border-b-2 text-xs font-medium transition ${
                activeTab === "storage"
                  ? "border-indigo-500 text-indigo-400 bg-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Storage Layout</span>
            </button>
            <button
              onClick={() => setActiveTab("evm")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 border-b-2 text-xs font-medium transition ${
                activeTab === "evm"
                  ? "border-indigo-500 text-indigo-400 bg-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>EVM Trace</span>
            </button>
          </div>

          {/* Console Content Display */}
          <div className="p-4 flex-1 overflow-y-auto max-h-[380px] space-y-3 text-slate-300">
            {activeTab === "compilation" && (
              <div>
                {!compileResult ? (
                  <div className="text-slate-500 py-8 text-center italic">
                    Click <span className="text-indigo-400 font-semibold">Compile</span> to check code for errors, ABI output, and storage layout.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        {compileResult.success ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400" />
                        )}
                        <span className={`font-semibold ${compileResult.success ? "text-emerald-400" : "text-rose-400"}`}>
                          {compileResult.success ? "Compilation Successful" : "Compilation Failed"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">solc v{compileResult.solcVersion}</span>
                    </div>

                    {/* Diagnostics / Error messages */}
                    {compileResult.diagnostics && compileResult.diagnostics.length > 0 && (
                      <div className="space-y-2">
                        {compileResult.diagnostics.map((diag: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-lg border text-[11px] leading-relaxed font-mono ${
                              diag.severity === "error"
                                ? "bg-rose-950/40 border-rose-800/60 text-rose-300"
                                : "bg-amber-950/30 border-amber-800/50 text-amber-300"
                            }`}
                          >
                            <div className="font-semibold mb-1 uppercase tracking-wider">[{diag.severity}]</div>
                            <pre className="whitespace-pre-wrap">{diag.formattedMessage || diag.message}</pre>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Compiled Contract Details */}
                    {compileResult.contracts && (
                      <div className="mt-4 space-y-2">
                        <div className="text-xs font-semibold text-slate-400">Compiled Artifacts:</div>
                        {Object.entries(compileResult.contracts).map(([name, data]: [string, any]) => (
                          <div key={name} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                            <div className="text-indigo-300 font-bold">{name}</div>
                            <div className="text-[11px] text-slate-400">
                              Bytecode Size: <span className="text-slate-200">{(data.bytecode.length / 2).toString()} bytes</span>
                            </div>

                            {data.functionSelectors && (
                              <div className="text-[10px] space-y-1">
                                <span className="text-slate-500">Function Selectors:</span>
                                {Object.entries(data.functionSelectors).map(([sig, selector]: [string, any]) => (
                                  <div key={sig} className="flex justify-between font-mono text-slate-400">
                                    <span>{sig}</span>
                                    <span className="text-indigo-400">{String(selector)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "execution" && (
              <div>
                {!executeResult ? (
                  <div className="text-slate-500 py-8 text-center italic">
                    Click <span className="text-indigo-400 font-semibold">Run / Execute</span> to simulate EVM execution and test state changes.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg space-y-1 text-emerald-300">
                      <div className="font-bold flex items-center justify-between">
                        <span>Status: {executeResult.status}</span>
                        <span className="text-xs font-mono text-emerald-400">{executeResult.type}</span>
                      </div>
                      <div className="text-[11px] text-emerald-400 font-mono">
                        Function Called: <span className="font-bold text-white">{executeResult.functionCalled}</span> ({executeResult.functionSelector})
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Contract Address:</span>
                        <span className="text-indigo-300">{executeResult.contractAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Caller (msg.sender):</span>
                        <span className="text-slate-200">{executeResult.caller}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Gas Consumed:</span>
                        <span className="text-amber-400 font-bold">{executeResult.gasUsed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Return Result:</span>
                        <span className="text-emerald-400 font-bold">{String(executeResult.result)}</span>
                      </div>
                    </div>

                    {executeResult.stateChanges && executeResult.stateChanges.length > 0 && (
                      <div className="p-3 bg-indigo-950/30 border border-indigo-900/50 rounded-lg space-y-1">
                        <div className="text-indigo-300 font-semibold text-[11px]">State Modification (Storage):</div>
                        {executeResult.stateChanges.map((sc: any, idx: number) => (
                          <div key={idx} className="text-[10px] text-slate-300 font-mono">
                            Slot {sc.slot?.slice(0, 10)}... : {sc.valueBefore} → <span className="text-emerald-400 font-bold">{sc.valueAfter}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "storage" && (
              <div className="space-y-3">
                <div className="text-slate-400 text-xs">
                  EVM Storage is key-value mapping of 32-byte slots (2^256 slots total).
                </div>
                {compileResult?.contracts ? (
                  Object.entries(compileResult.contracts).map(([name, data]: [string, any]) => (
                    <div key={name} className="p-3 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                      <div className="text-indigo-300 font-bold">{name} Storage Layout</div>
                      {data.storageLayout?.storage && data.storageLayout.storage.length > 0 ? (
                        <div className="space-y-1">
                          {data.storageLayout.storage.map((st: any, idx: number) => (
                            <div key={idx} className="p-2 bg-slate-950 border border-slate-800 rounded text-[11px] flex justify-between font-mono">
                              <div>
                                <span className="text-indigo-400 font-semibold">{st.label}</span> ({st.type})
                              </div>
                              <div className="text-amber-400">
                                Slot {st.slot}, Offset {st.offset}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic">No persistent state variables declared or standard slot packing applies.</div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic py-4">Compile contract to inspect storage layout slot numbers.</div>
                )}
              </div>
            )}

            {activeTab === "evm" && (
              <div className="space-y-2">
                <div className="text-xs text-slate-400 mb-2">EVM Instruction Execution Trace:</div>
                {executeResult?.evmTrace ? (
                  executeResult.evmTrace.map((line: string, idx: number) => (
                    <div key={idx} className="p-2 bg-slate-900 border border-slate-800 rounded text-[11px] font-mono text-indigo-300">
                      {line}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic py-4">Run contract function to generate step-by-step EVM call trace.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
