"use client";

import React, { useState } from "react";
import { CURRICULUM_LESSONS, Lesson } from "@/data/curriculum";
import { PRACTICAL_EXERCISES, Exercise } from "@/data/exercises";
import { SECURITY_CATALOG } from "@/data/security";
import { SOLIDITY_COVERAGE_MAP } from "@/data/coverageMap";
import { SolidityIDE } from "@/components/SolidityIDE";
import { AITutorDrawer } from "@/components/AITutorDrawer";
import {
  BookOpen,
  Code2,
  ShieldAlert,
  Search,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Cpu,
  Layers,
  Sparkles,
  Trophy,
  ChevronRight,
  Flame,
  Lightbulb,
  FileText
} from "lucide-react";

export default function SolidityPlatformApp() {
  const [activeTab, setActiveTab] = useState<"learn" | "ide" | "exercises" | "security" | "coverage">("learn");
  const [currentLesson, setCurrentLesson] = useState<Lesson>(CURRICULUM_LESSONS[0]);
  const [currentExercise, setCurrentExercise] = useState<Exercise>(PRACTICAL_EXERCISES[0]);
  const [explanationLevel, setExplanationLevel] = useState<"beginner" | "developer" | "evm" | "security">("beginner");

  const [searchQuery, setSearchQuery] = useState("");
  const [exerciseCode, setExerciseCode] = useState(currentExercise.initialCode);
  const [hintTier, setHintTier] = useState<number>(0);

  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [exerciseSuccess, setExerciseSuccess] = useState<boolean | null>(null);

  // Filter lessons by search query
  const filteredLessons = CURRICULUM_LESSONS.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLessonSelect = (lesson: Lesson) => {
    setCurrentLesson(lesson);
    setQuizAnswers({});
    setActiveTab("learn");

    // Match exercise if available
    if (lesson.exerciseId) {
      const foundEx = PRACTICAL_EXERCISES.find((e) => e.id === lesson.exerciseId);
      if (foundEx) {
        setCurrentExercise(foundEx);
        setExerciseCode(foundEx.initialCode);
        setHintTier(0);
        setExerciseSuccess(null);
      }
    }
  };

  const handleQuizOptionSelect = (quizId: string, optionIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [quizId]: optionIndex }));
  };

  const markLessonComplete = (lessonId: string) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons((prev) => [...prev, lessonId]);
    }
  };

  const handleRunExerciseValidation = async () => {
    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sources: { "Contract.sol": exerciseCode } })
      });
      const data = await res.json();
      if (data.success) {
        setExerciseSuccess(true);
        markLessonComplete(currentLesson.id);
      } else {
        setExerciseSuccess(false);
      }
    } catch {
      setExerciseSuccess(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div className="p-4 border-b border-slate-800 space-y-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white">Solidity Academy</h1>
              <span className="text-[10px] text-indigo-400 font-mono">Official Doc & EVM Platform</span>
            </div>
          </div>

          {/* Search Engine Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search concepts, opcodes, features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Main Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs">
          {/* Navigation Category Tabs */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab("learn")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition font-medium ${
                activeTab === "learn" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <BookOpen className="w-4 h-4" />
                <span>Curriculum & Lessons</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("ide")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition font-medium ${
                activeTab === "ide" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Code2 className="w-4 h-4" />
                <span>Solidity IDE</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("exercises")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition font-medium ${
                activeTab === "exercises" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Trophy className="w-4 h-4" />
                <span>Practice Exercises</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-300 font-mono">
                {PRACTICAL_EXERCISES.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition font-medium ${
                activeTab === "security" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Security Lab</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("coverage")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition font-medium ${
                activeTab === "coverage" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileText className="w-4 h-4" />
                <span>Doc Coverage Map</span>
              </div>
            </button>
          </div>

          {/* Lesson List Sidebar Section */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase px-3">
              Curriculum Roadmap
            </span>
            <div className="mt-2 space-y-1">
              {filteredLessons.map((lesson) => {
                const isSelected = currentLesson.id === lesson.id;
                const isDone = completedLessons.includes(lesson.id);
                return (
                  <button
                    key={lesson.id}
                    onClick={() => handleLessonSelect(lesson)}
                    className={`w-full text-left p-2.5 rounded-lg transition flex items-start space-x-2.5 border ${
                      isSelected
                        ? "bg-slate-800/90 border-indigo-500/50 text-white"
                        : "border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-[9px] font-mono text-slate-500">
                        {lesson.level}
                      </div>
                    )}
                    <div className="truncate">
                      <div className="font-medium text-xs truncate">{lesson.title}</div>
                      <div className="text-[10px] text-slate-500 truncate">{lesson.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Progress Bar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Progress</span>
            <span className="text-indigo-400 font-mono font-bold">
              {completedLessons.length} / {CURRICULUM_LESSONS.length}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300"
              style={{
                width: `${(completedLessons.length / CURRICULUM_LESSONS.length) * 100}%`
              }}
            />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="px-6 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <span className="px-2.5 py-1 bg-indigo-950/80 border border-indigo-800/50 text-indigo-300 rounded-md font-mono text-xs">
              Level {currentLesson.level}
            </span>
            <h2 className="text-base font-bold text-white truncate">{currentLesson.title}</h2>
          </div>

          <a
            href={currentLesson.officialDocUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition"
          >
            <span>Official Docs</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </header>

        {/* Dynamic Tab Body */}
        <div className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === "learn" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Lesson Explanations & Diagrams */}
              <div className="lg:col-span-7 space-y-6">
                {/* Multilevel Explanation Depth Selector */}
                <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl flex space-x-1">
                  <button
                    onClick={() => setExplanationLevel("beginner")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                      explanationLevel === "beginner" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    🌱 Beginner
                  </button>
                  <button
                    onClick={() => setExplanationLevel("developer")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                      explanationLevel === "developer" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    💻 Developer
                  </button>
                  <button
                    onClick={() => setExplanationLevel("evm")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                      explanationLevel === "evm" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    ⚡ EVM Depth
                  </button>
                  <button
                    onClick={() => setExplanationLevel("security")}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                      explanationLevel === "security" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    🛡️ Security
                  </button>
                </div>

                {/* Explanation Content Box */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 leading-relaxed text-sm text-slate-200">
                  <div className="font-semibold text-indigo-400 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="capitalize">{explanationLevel} Explanation</span>
                  </div>
                  <p className="text-slate-300">{currentLesson.explanation[explanationLevel]}</p>
                </div>

                {/* Execution Flow Diagram */}
                {currentLesson.executionFlowDiagram && (
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      <span>Step-by-step EVM Execution Flow</span>
                    </h3>
                    <div className="space-y-2">
                      {currentLesson.executionFlowDiagram.map((step, idx) => (
                        <div key={idx} className="flex items-center space-x-3 text-xs font-mono p-2 bg-slate-950 border border-slate-800 rounded-lg">
                          <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                            {idx + 1}
                          </span>
                          <span className="text-slate-300">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Code Explanation Analysis */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                    <Code2 className="w-4 h-4 text-indigo-400" />
                    <span>Line-by-Line Code Breakdown</span>
                  </h3>
                  <div className="space-y-2">
                    {currentLesson.codeExplanation.map((item, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                        <code className="text-xs font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40 block">
                          {item.lineOrBlock}
                        </code>
                        <p className="text-xs text-slate-400">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Recall Quiz */}
                {currentLesson.quickQuiz && currentLesson.quickQuiz.length > 0 && (
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-2">
                      <HelpCircle className="w-4 h-4" />
                      <span>Active Recall Quiz</span>
                    </h3>
                    {currentLesson.quickQuiz.map((q) => {
                      const selectedIdx = quizAnswers[q.id];
                      return (
                        <div key={q.id} className="space-y-3">
                          <p className="text-sm font-medium text-slate-200">{q.question}</p>
                          <div className="space-y-2">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = selectedIdx === oIdx;
                              const isCorrect = oIdx === q.correctIndex;
                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleQuizOptionSelect(q.id, oIdx)}
                                  className={`w-full text-left p-3 rounded-lg border text-xs transition ${
                                    isSelected
                                      ? isCorrect
                                        ? "bg-emerald-950/60 border-emerald-600 text-emerald-200"
                                        : "bg-rose-950/60 border-rose-600 text-rose-200"
                                      : "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                                  }`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                          {selectedIdx !== undefined && (
                            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed">
                              <span className="font-bold text-indigo-400">Explanation: </span>
                              {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: IDE & AI Tutor Panel */}
              <div className="lg:col-span-5 space-y-6">
                {/* IDE Instance */}
                <div className="h-[480px]">
                  <SolidityIDE initialCode={currentLesson.initialCode} />
                </div>

                {/* Integrated AI Tutor Drawer */}
                <div className="h-[420px]">
                  <AITutorDrawer
                    currentLessonTitle={currentLesson.title}
                    currentLessonLevel={currentLesson.level}
                    currentCode={currentLesson.initialCode}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "ide" && (
            <div className="h-[760px]">
              <SolidityIDE initialCode={currentLesson.initialCode} />
            </div>
          )}

          {activeTab === "exercises" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Exercise Selection Sidebar */}
              <div className="lg:col-span-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Exercise Catalog</h3>
                {PRACTICAL_EXERCISES.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => {
                      setCurrentExercise(ex);
                      setExerciseCode(ex.initialCode);
                      setHintTier(0);
                      setExerciseSuccess(null);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition ${
                      currentExercise.id === ex.id
                        ? "bg-slate-900 border-indigo-500/60 text-white"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-indigo-300">{ex.title}</span>
                      <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                        {ex.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{ex.prompt}</p>
                  </button>
                ))}
              </div>

              {/* Exercise Workspace */}
              <div className="lg:col-span-8 space-y-6">
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">{currentExercise.title}</h3>
                    <span className="text-xs font-mono text-indigo-400">Solidity {currentExercise.solidityVersion}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{currentExercise.prompt}</p>

                  {/* Progressive Hint Drawer */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-amber-400 flex items-center space-x-1.5">
                        <Lightbulb className="w-3.5 h-3.5" />
                        <span>Progressive 3-Tier Hints</span>
                      </span>
                      {hintTier < 3 && (
                        <button
                          onClick={() => setHintTier((prev) => Math.min(prev + 1, 3))}
                          className="text-[11px] text-indigo-400 hover:underline"
                        >
                          Show Hint Tier {hintTier + 1}
                        </button>
                      )}
                    </div>

                    {hintTier >= 1 && (
                      <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300">
                        <span className="font-bold text-indigo-400">Tier 1 (Conceptual): </span>
                        {currentExercise.hints.tier1Conceptual}
                      </div>
                    )}
                    {hintTier >= 2 && (
                      <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300">
                        <span className="font-bold text-indigo-400">Tier 2 (Specific): </span>
                        {currentExercise.hints.tier2Specific}
                      </div>
                    )}
                    {hintTier >= 3 && (
                      <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300">
                        <span className="font-bold text-indigo-400">Tier 3 (Feature Point): </span>
                        {currentExercise.hints.tier3FeaturePoint}
                      </div>
                    )}
                  </div>
                </div>

                {/* Editor & Validation Action */}
                <div className="h-[420px]">
                  <SolidityIDE
                    initialCode={exerciseCode}
                    onCodeChange={(c) => setExerciseCode(c)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={handleRunExerciseValidation}
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition shadow-lg shadow-emerald-600/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit & Validate Solution</span>
                  </button>

                  {exerciseSuccess !== null && (
                    <div
                      className={`text-xs font-semibold px-4 py-2 rounded-lg border ${
                        exerciseSuccess
                          ? "bg-emerald-950 border-emerald-700 text-emerald-300"
                          : "bg-rose-950 border-rose-700 text-rose-300"
                      }`}
                    >
                      {exerciseSuccess
                        ? "🎉 Solution Verified & Exercise Completed!"
                        : "❌ Verification failed. Check compiler output or ask AI Tutor!"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="p-5 bg-amber-950/30 border border-amber-800/50 rounded-xl space-y-2">
                <h3 className="font-bold text-amber-300 text-sm flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Solidity Smart Contract Security Lab</span>
                </h3>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  Analyze vulnerable contract patterns, understand exploit execution mechanics, and learn defense-in-depth secure coding standards.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {SECURITY_CATALOG.map((sec) => (
                  <div key={sec.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="p-1.5 bg-rose-950 text-rose-400 rounded-lg border border-rose-800/60 text-xs font-bold">
                          {sec.severity}
                        </span>
                        <h4 className="font-bold text-slate-100 text-sm">{sec.title}</h4>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">{sec.category}</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">{sec.summary}</p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg space-y-2">
                        <div className="text-xs font-bold text-rose-400">⚠️ Vulnerable Code Pattern</div>
                        <pre className="text-[11px] font-mono text-rose-200 whitespace-pre-wrap overflow-x-auto">
                          {sec.vulnerableCodeSnippet}
                        </pre>
                      </div>

                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg space-y-2">
                        <div className="text-xs font-bold text-emerald-400">🛡️ Secure Refactored Code</div>
                        <pre className="text-[11px] font-mono text-emerald-200 whitespace-pre-wrap overflow-x-auto">
                          {sec.fixedCodeSnippet}
                        </pre>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-indigo-400">Security Reasoning: </span>
                      {sec.securityReasoning}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "coverage" && (
            <div className="space-y-6">
              <div className="p-5 bg-indigo-950/30 border border-indigo-800/50 rounded-xl space-y-2">
                <h3 className="font-bold text-indigo-300 text-sm flex items-center space-x-2">
                  <Layers className="w-4 h-4" />
                  <span>Official Solidity Documentation Coverage Map (v0.8.37)</span>
                </h3>
                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  Comprehensive tracking of every documentation section, language feature, EVM concept, and security module.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {SOLIDITY_COVERAGE_MAP.map((item) => (
                  <div key={item.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="px-2 py-0.5 bg-slate-800 text-indigo-400 rounded text-xs font-mono font-bold">
                          L{item.level}
                        </span>
                        <h4 className="font-bold text-xs text-slate-100">{item.title}</h4>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">{item.docSection}</span>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{item.summary}</p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {item.relatedConcepts.map((c, i) => (
                        <span key={i} className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-slate-400">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
