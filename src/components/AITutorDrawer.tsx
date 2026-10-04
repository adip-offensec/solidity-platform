"use client";

import React, { useState } from "react";
import { Sparkles, Send, Bot, User, HelpCircle, ShieldAlert, Code } from "lucide-react";

interface AITutorDrawerProps {
  currentLessonTitle?: string;
  currentLessonLevel?: number;
  currentCode?: string;
}

export function AITutorDrawer({ currentLessonTitle, currentLessonLevel, currentCode }: AITutorDrawerProps) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "👋 Hi! I'm Jules, your AI Solidity Tutor. Ask me anything about Solidity, gas fees, EVM storage layout, security vulnerabilities, or line-by-line code explanations!"
    }
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (promptText?: string, actionType?: string) => {
    const textToSend = promptText || inputPrompt;
    if (!textToSend.trim()) return;

    const userMessage = { sender: "user" as const, text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    if (!promptText) setInputPrompt("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToSend,
          action: actionType || "GENERAL_QUESTION",
          code: currentCode,
          lessonTitle: currentLessonTitle,
          lessonLevel: currentLessonLevel
        })
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: data.reply || "Sorry, I could not generate a response right now." }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Error connecting to AI Tutor service." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">AI Solidity Tutor</h3>
            <p className="text-[10px] text-slate-400">Context: {currentLessonTitle || "General Practice"}</p>
          </div>
        </div>
      </div>

      {/* Quick Action Chips */}
      <div className="p-2 bg-slate-900/60 border-b border-slate-800 flex space-x-1.5 overflow-x-auto text-[11px]">
        <button
          onClick={() => handleSendMessage("Explain this code step by step", "EXPLAIN_CODE")}
          className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 whitespace-nowrap transition"
        >
          <Code className="w-3 h-3 text-indigo-400" />
          <span>Explain Code</span>
        </button>
        <button
          onClick={() => handleSendMessage("Check my contract for security vulnerabilities", "SECURITY_AUDIT")}
          className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 whitespace-nowrap transition"
        >
          <ShieldAlert className="w-3 h-3 text-amber-400" />
          <span>Security Audit</span>
        </button>
        <button
          onClick={() => handleSendMessage("Give me a hint without giving away the answer", "GIVE_HINT")}
          className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md border border-slate-700 whitespace-nowrap transition"
        >
          <HelpCircle className="w-3 h-3 text-purple-400" />
          <span>Get Hint</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[480px]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2.5 ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
          >
            <div
              className={`p-1.5 rounded-lg text-white ${
                msg.sender === "user" ? "bg-indigo-600" : "bg-purple-900/50 text-purple-300 border border-purple-700/50"
              }`}
            >
              {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-3 rounded-xl text-xs leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white font-medium"
                  : "bg-slate-950 border border-slate-800 text-slate-200"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2 text-xs text-indigo-400 animate-pulse italic p-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Jules is analyzing Solidity docs and EVM state...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask a question (e.g. Why does SSTORE cost gas?)..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
