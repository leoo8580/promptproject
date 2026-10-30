/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ProjectRequirements,
  StrategyRunResult,
  OllamaStatus,
} from '../../types';
import { CartoonMascot } from '../CartoonMascot';
import {
  Clock,
  Eye,
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Cpu,
  Layers,
  ArrowRight,
  Terminal,
  Activity,
} from 'lucide-react';

interface PromptLabProps {
  requirements: ProjectRequirements;
  onRunGeneration: (params: {
    strategy: 'strategy_a' | 'strategy_b' | 'strategy_c' | 'all';
    model_name: string;
    temperature: number;
    seed: number;
  }) => Promise<void>;
  isRunning: boolean;
  currentResults: Record<string, StrategyRunResult> | null;
  ollamaStatus: OllamaStatus | null;
  onInspectPrompt: (strategyId: string, promptText: string, rawResponse: string) => void;
  onViewTestCases: () => void;
  onRunModelComparison?: (params: {
    strategy_id: 'strategy_a' | 'strategy_b' | 'strategy_c';
    models: string[];
    temperature: number;
    seed: number;
  }) => Promise<void>;
  modelComparisonResults?: Record<string, StrategyRunResult> | null;
}

export const PromptLab: React.FC<PromptLabProps> = ({
  requirements,
  onRunGeneration,
  isRunning,
  currentResults,
  ollamaStatus,
  onInspectPrompt,
  onViewTestCases,
  onRunModelComparison,
  modelComparisonResults,
}) => {
  // Mode switcher: 'strategy_comparison' or 'model_comparison'
  const [labMode, setLabMode] = useState<'strategy_comparison' | 'model_comparison'>('strategy_comparison');

  // Strategy comparison state
  const [selectedStrategy, setSelectedStrategy] = useState<'all' | 'strategy_a' | 'strategy_b' | 'strategy_c'>('all');
  const [modelName, setModelName] = useState<string>(ollamaStatus?.selected_model || 'llama3:latest');
  const [temperature, setTemperature] = useState<number>(0.2);
  const [seed, setSeed] = useState<number>(42);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeStrategyTab, setActiveStrategyTab] = useState<'strategy_a' | 'strategy_b' | 'strategy_c'>('strategy_b');

  // Model comparison state (llama3:latest vs codellama:latest)
  const [fixedStrategyForModelComparison, setFixedStrategyForModelComparison] = useState<'strategy_a' | 'strategy_b' | 'strategy_c'>('strategy_b');
  const [activeModelTab, setActiveModelTab] = useState<string>('llama3:latest');

  // Dynamic model options from Ollama tags
  const dynamicModels = React.useMemo(() => {
    const list = ollamaStatus?.available_models && ollamaStatus.available_models.length > 0
      ? [...ollamaStatus.available_models]
      : ['llama3:latest', 'codellama:latest'];
    if (!list.includes('llama3:latest')) list.unshift('llama3:latest');
    if (!list.includes('codellama:latest')) list.push('codellama:latest');
    return Array.from(new Set(list));
  }, [ollamaStatus?.available_models]);

  // Keep modelName synced if needed
  React.useEffect(() => {
    if (ollamaStatus?.selected_model && !dynamicModels.includes(modelName)) {
      setModelName(ollamaStatus.selected_model);
    }
  }, [ollamaStatus?.selected_model, dynamicModels]);

  const isModelInstalled = (name: string) => {
    if (!ollamaStatus?.reachable) return true; // Offline testbed works
    if (!ollamaStatus.available_models || ollamaStatus.available_models.length === 0) return true;
    return ollamaStatus.available_models.includes(name);
  };

  const handleExecuteStrategyComparison = async () => {
    await onRunGeneration({
      strategy: selectedStrategy,
      model_name: modelName,
      temperature,
      seed,
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#8b5cf6', '#6366f1', '#34d399', '#f43f5e'],
      });
    } catch {
      // Ignore
    }
  };

  const handleExecuteModelComparison = async () => {
    if (!onRunModelComparison) return;
    await onRunModelComparison({
      strategy_id: fixedStrategyForModelComparison,
      models: ['llama3:latest', 'codellama:latest'],
      temperature,
      seed,
    });

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'],
      });
    } catch {
      // Ignore
    }
  };

  const stratA = currentResults?.strategy_a;
  const stratB = currentResults?.strategy_b;
  const stratC = currentResults?.strategy_c;
  const currentResultForTab = currentResults?.[activeStrategyTab];

  const llama3Result = modelComparisonResults?.['llama3:latest'];
  const codellamaResult = modelComparisonResults?.['codellama:latest'];
  const activeModelResult = modelComparisonResults?.[activeModelTab];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Laboratory Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-2 bg-white dark:bg-slate-900 border-2 border-violet-100 dark:border-violet-950 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLabMode('strategy_comparison')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              labMode === 'strategy_comparison'
                ? 'bg-gradient-to-r from-violet-600 to-emerald-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Mode 1: Prompt Strategy Comparison</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">A vs B vs C</span>
          </button>

          <button
            onClick={() => setLabMode('model_comparison')}
            className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
              labMode === 'model_comparison'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Mode 2: Model Comparison Mode</span>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Llama 3 vs CodeLlama</span>
          </button>
        </div>

        <div className="text-[11px] font-bold text-slate-500 px-3 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-emerald-500" />
          <span>Ollama 0.40.13 Local Engine</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: PROMPT STRATEGY COMPARISON                            */}
      {/* ============================================================== */}
      {labMode === 'strategy_comparison' && (
        <>
          {/* Header Card */}
          <div className="border-2 border-violet-100 dark:border-violet-950 rounded-3xl p-6 bg-gradient-to-r from-violet-50/70 via-white to-emerald-50/70 dark:from-slate-900 dark:to-slate-900 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-300">
                  <span>Experiment Flow</span>
                  <span>·</span>
                  <span>3-Way Prompt Strategy Comparison</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Benchmark Prompt Engineering Techniques
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Dispatch identical software requirements to <strong className="text-violet-700 dark:text-violet-300">Strategy A (Basic)</strong>, <strong className="text-emerald-700 dark:text-emerald-300">Strategy B (Structured)</strong>, and <strong className="text-violet-700 dark:text-violet-300">Strategy C (Few-Shot)</strong> using local Ollama model <code className="bg-violet-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-violet-900 dark:text-violet-200 font-mono font-bold">{modelName}</code>.
                </p>

                {/* Execution Button and Settings Toggle */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExecuteStrategyComparison}
                    disabled={isRunning || requirements.requirements.length === 0}
                    className="px-6 py-3 text-sm font-black text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 transition-all flex items-center gap-2.5"
                  >
                    {isRunning ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Brewing Test Cases in Laboratory...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Run 3-Way Strategy Comparison</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-violet-600" />
                    <span>{showAdvanced ? 'Hide Model Settings' : 'Configure Model & Seed'}</span>
                  </button>
                </div>
              </div>

              {/* Cartoon Mascot */}
              <div className="shrink-0 flex justify-center lg:justify-end">
                <CartoonMascot
                  mood={isRunning ? 'thinking' : currentResults ? 'celebrating' : 'happy'}
                  speechText={
                    isRunning
                      ? `Running generation on ${modelName}! Capturing load duration and eval tokens...`
                      : currentResults
                      ? 'Experiment complete! Look at how Strategy B and C outperform Strategy A in coverage!'
                      : `Defaulting to ${modelName}. Ready to launch prompt comparison!`
                  }
                  size="lg"
                />
              </div>
            </div>

            {/* Missing Model Installation Warning Banner */}
            {!isModelInstalled(modelName) && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Model &apos;{modelName}&apos; is not installed in local Ollama</span>
                </div>
                <p className="text-[11px] font-medium leading-relaxed">
                  SpecCraft AI will <strong>never automatically download</strong> models. To install this model, run the following command in Windows PowerShell:
                </p>
                <div className="flex items-center justify-between bg-amber-100/80 px-3 py-2 rounded-xl font-mono text-[11px] text-amber-950 border border-amber-300">
                  <span>ollama pull {modelName}</span>
                  <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded font-sans font-bold">Copy to PowerShell</span>
                </div>
              </div>
            )}

            {/* Model Configuration Dropdown & Sliders */}
            {showAdvanced && (
              <div className="mt-5 pt-4 border-t-2 border-violet-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Installed Model
                  </label>
                  <select
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full font-mono bg-white dark:bg-slate-800 border-2 border-violet-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 font-bold"
                  >
                    {dynamicModels.map((m) => (
                      <option key={m} value={m}>
                        {m} {m === 'llama3:latest' ? '(Default)' : m === 'codellama:latest' ? '(Alternative)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Strategy Mode
                  </label>
                  <select
                    value={selectedStrategy}
                    onChange={(e) => setSelectedStrategy(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-800 border-2 border-violet-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    <option value="all">Compare All 3 (Recommended)</option>
                    <option value="strategy_a">Strategy A Only (Basic)</option>
                    <option value="strategy_b">Strategy B Only (Structured)</option>
                    <option value="strategy_c">Strategy C Only (Few-Shot)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Temperature</span>
                    <span className="font-mono text-violet-600">{temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-violet-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Reproducibility Seed
                  </label>
                  <input
                    type="number"
                    value={seed}
                    onChange={(e) => setSeed(parseInt(e.target.value, 10) || 0)}
                    className="w-full font-mono bg-white dark:bg-slate-800 border-2 border-violet-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Running Animation */}
          {isRunning && (
            <div className="p-8 border-2 border-emerald-400 rounded-3xl bg-gradient-to-r from-emerald-50 via-white to-violet-50 text-center space-y-3 shadow-md animate-pulse">
              <div className="text-4xl animate-bounce">🧪</div>
              <h3 className="text-base font-black text-emerald-950">
                Running 3-Way Prompt Experiment with {modelName}
              </h3>
              <p className="text-xs text-slate-700 font-semibold max-w-md mx-auto">
                Executing Strategy A, B, and C with identical parameters (temp: {temperature}, seed: {seed}). Capturing total duration, load time, and generation speed...
              </p>
            </div>
          )}

          {/* Strategy Scoreboard */}
          <div className="border-2 border-violet-100 dark:border-violet-950 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-violet-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-violet-50/40 to-emerald-50/30">
              <div className="flex items-center gap-2">
                <span className="text-lg">📊</span>
                <h2 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Prompt Engineering Scoreboard ({modelName})
                </h2>
              </div>
              {currentResults && (
                <button
                  onClick={onViewTestCases}
                  className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:text-violet-800 flex items-center gap-1.5 bg-violet-50 dark:bg-slate-800 px-3 py-1 rounded-xl border border-violet-200 dark:border-slate-700"
                >
                  <span>Explore Generated Test Cases ({Object.values(currentResults).reduce((acc, curr) => acc + curr.parsed_test_cases.length, 0)})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-violet-50/80 border-b-2 border-violet-100 text-slate-800 font-black">
                  <tr>
                    <th className="py-3 px-4 font-black">Strategy</th>
                    <th className="py-3 px-3 font-black text-right">Cases</th>
                    <th className="py-3 px-3 font-black text-right">Req Coverage %</th>
                    <th className="py-3 px-3 font-black text-right">Schema Validity %</th>
                    <th className="py-3 px-3 font-black text-right">Completeness %</th>
                    <th className="py-3 px-3 font-black text-center">Categories (5)</th>
                    <th className="py-3 px-3 font-black text-right">Time (s)</th>
                    <th className="py-3 px-3 font-black text-right">Speed (tok/s)</th>
                    <th className="py-3 px-4 font-black text-center">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-violet-100">
                  {/* Strategy A */}
                  <tr className="hover:bg-violet-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900 flex items-center gap-2">
                      <span className="text-base">🐣</span>
                      <div>
                        <div className="font-bold text-slate-900">Strategy A (Basic)</div>
                        <div className="text-[10px] text-slate-600 font-semibold">Minimal instruction</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900">{stratA ? stratA.metrics.total_test_cases : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-amber-700 bg-amber-50/60 rounded px-1.5">{stratA ? `${stratA.metrics.requirement_coverage_pct}%` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900">{stratA ? `${stratA.metrics.schema_validity_pct}%` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900">{stratA ? `${stratA.metrics.completeness_pct}%` : '—'}</td>
                    <td className="py-3.5 px-3 text-center font-mono font-black text-slate-800">{stratA ? `${stratA.metrics.categories_represented.length}/5` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-700">{stratA ? `${stratA.metrics.generation_time_seconds}s` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-violet-700">{stratA?.metrics.tokens_per_second ? `${stratA.metrics.tokens_per_second}` : '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      {stratA && (
                        <button
                          onClick={() => onInspectPrompt('strategy_a', stratA.prompt_used, stratA.raw_response)}
                          className="p-1.5 text-violet-700 hover:bg-violet-100 rounded-lg transition-colors font-bold"
                          title="Inspect Prompt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Strategy B */}
                  <tr className="bg-emerald-50/60 hover:bg-emerald-50/90 font-semibold transition-colors">
                    <td className="py-3.5 px-4 font-black text-emerald-950 flex items-center gap-2">
                      <span className="text-base">📋</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-emerald-950">Strategy B (Structured)</span>
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black uppercase">Top</span>
                        </div>
                        <div className="text-[10px] text-emerald-800 font-semibold">Role + Schema + Anti-Hallucination</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-950">{stratB ? stratB.metrics.total_test_cases : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-700 bg-emerald-100/60 rounded px-1.5">{stratB ? `${stratB.metrics.requirement_coverage_pct}%` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-800">{stratB ? `${stratB.metrics.schema_validity_pct}%` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-800">{stratB ? `${stratB.metrics.completeness_pct}%` : '—'}</td>
                    <td className="py-3.5 px-3 text-center font-mono font-black text-emerald-800">{stratB ? `${stratB.metrics.categories_represented.length}/5` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-800">{stratB ? `${stratB.metrics.generation_time_seconds}s` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700">{stratB?.metrics.tokens_per_second ? `${stratB.metrics.tokens_per_second}` : '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      {stratB && (
                        <button
                          onClick={() => onInspectPrompt('strategy_b', stratB.prompt_used, stratB.raw_response)}
                          className="p-1.5 text-emerald-800 hover:bg-emerald-200 rounded-lg transition-colors font-bold"
                          title="Inspect Prompt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Strategy C */}
                  <tr className="hover:bg-violet-50/40 transition-colors">
                    <td className="py-3.5 px-4 font-black text-violet-950 flex items-center gap-2">
                      <span className="text-base">🚀</span>
                      <div>
                        <div className="font-bold text-violet-950">Strategy C (Few-Shot)</div>
                        <div className="text-[10px] text-violet-700 font-semibold">Structured + 2 Examples</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900">{stratC ? stratC.metrics.total_test_cases : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-violet-700 bg-violet-100/60 rounded px-1.5">{stratC ? `${stratC.metrics.requirement_coverage_pct}%` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-violet-800">{stratC ? `${stratC.metrics.schema_validity_pct}%` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-violet-800">{stratC ? `${stratC.metrics.completeness_pct}%` : '—'}</td>
                    <td className="py-3.5 px-3 text-center font-mono font-black text-violet-800">{stratC ? `${stratC.metrics.categories_represented.length}/5` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-700">{stratC ? `${stratC.metrics.generation_time_seconds}s` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-violet-700">{stratC?.metrics.tokens_per_second ? `${stratC.metrics.tokens_per_second}` : '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      {stratC && (
                        <button
                          onClick={() => onInspectPrompt('strategy_c', stratC.prompt_used, stratC.raw_response)}
                          className="p-1.5 text-violet-700 hover:bg-violet-100 rounded-lg transition-colors font-bold"
                          title="Inspect Prompt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Test Case Inspection Tabs */}
          {currentResults && (
            <div className="border-2 border-violet-100 dark:border-violet-950 rounded-3xl p-5 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-violet-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveStrategyTab('strategy_b')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeStrategyTab === 'strategy_b'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    📋 Strategy B ({stratB?.parsed_test_cases.length || 0} Cases)
                  </button>
                  <button
                    onClick={() => setActiveStrategyTab('strategy_c')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeStrategyTab === 'strategy_c'
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'bg-violet-50 text-violet-800 hover:bg-violet-100'
                    }`}
                  >
                    🚀 Strategy C ({stratC?.parsed_test_cases.length || 0} Cases)
                  </button>
                  <button
                    onClick={() => setActiveStrategyTab('strategy_a')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeStrategyTab === 'strategy_a'
                        ? 'bg-slate-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🐣 Strategy A ({stratA?.parsed_test_cases.length || 0} Cases)
                  </button>
                </div>

                {currentResultForTab && (
                  <button
                    onClick={() =>
                      onInspectPrompt(
                        activeStrategyTab,
                        currentResultForTab.prompt_used,
                        currentResultForTab.raw_response
                      )
                    }
                    className="text-xs font-bold text-violet-600 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Dispatched Prompt</span>
                  </button>
                )}
              </div>

              {currentResultForTab && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {currentResultForTab.parsed_test_cases.map((tc) => (
                    <div
                      key={tc.test_id}
                      className="p-3.5 rounded-2xl border-2 border-violet-50 dark:border-slate-800 bg-violet-50/20 dark:bg-slate-800/40 text-xs flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-violet-900 bg-violet-100 px-2.5 py-0.5 rounded-lg border border-violet-200">
                            {tc.test_id}
                          </span>
                          <span className="font-mono text-emerald-900 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            {(tc.requirement_ids || []).join(', ')}
                          </span>
                          <span className="font-black text-slate-900 text-xs">
                            {tc.title}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-200">
                            {tc.category}
                          </span>
                        </div>

                        <p className="text-slate-800 text-xs leading-relaxed">
                          <strong className="text-violet-950 font-black">Expected Result:</strong> {tc.expected_result}
                        </p>

                        {tc.assumptions && tc.assumptions.length > 0 && (
                          <div className="text-xs text-amber-900 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            ⚠️ <span>Assumption:</span> {tc.assumptions.join('; ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* MODE 2: MODEL COMPARISON MODE (Llama 3 vs CodeLlama)            */}
      {/* ============================================================== */}
      {labMode === 'model_comparison' && (
        <>
          {/* Header Card */}
          <div className="border-2 border-emerald-100 dark:border-emerald-950 rounded-3xl p-6 bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/70 dark:from-slate-900 dark:to-slate-900 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Model Comparison Laboratory</span>
                  <span>·</span>
                  <span>llama3:latest vs codellama:latest</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Compare Llama 3 vs CodeLlama Directly
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Evaluate both of your installed Ollama models under a <strong>fixed prompt strategy</strong> to directly compare general reasoning vs code-specialized test synthesis, latency, memory load time, and token generation speed.
                </p>

                {/* Model Comparison Controls */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExecuteModelComparison}
                    disabled={isRunning || requirements.requirements.length === 0}
                    className="px-6 py-3 text-sm font-black text-white bg-gradient-to-r from-emerald-600 via-teal-600 to-violet-700 hover:from-emerald-700 hover:to-violet-800 rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 transition-all flex items-center gap-2.5"
                  >
                    {isRunning ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Evaluating Llama 3 vs CodeLlama...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-current" />
                        <span>Compare Llama 3 vs CodeLlama</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-2xl border-2 border-emerald-200 text-xs">
                    <span className="font-bold text-slate-700">Fixed Prompt:</span>
                    <select
                      value={fixedStrategyForModelComparison}
                      onChange={(e) => setFixedStrategyForModelComparison(e.target.value as any)}
                      className="font-bold text-emerald-700 bg-transparent outline-none cursor-pointer"
                    >
                      <option value="strategy_b">Strategy B (Structured)</option>
                      <option value="strategy_c">Strategy C (Few-Shot)</option>
                      <option value="strategy_a">Strategy A (Basic)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cartoon Mascot */}
              <div className="shrink-0 flex justify-center lg:justify-end">
                <CartoonMascot
                  mood={isRunning ? 'thinking' : modelComparisonResults ? 'celebrating' : 'happy'}
                  speechText={
                    isRunning
                      ? 'Benchmarking Llama 3 against CodeLlama side by side!'
                      : modelComparisonResults
                      ? 'Model benchmark complete! See how CodeLlama focuses on boundary assertions while Llama 3 is faster!'
                      : 'Ready! Both llama3:latest and codellama:latest will receive the exact same prompt.'
                  }
                  size="lg"
                />
              </div>
            </div>

            {/* Verification of Model Availability */}
            {(!isModelInstalled('llama3:latest') || !isModelInstalled('codellama:latest')) && (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-black text-amber-950">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Ensure both models are installed locally for live Ollama inference</span>
                </div>
                <p className="text-[11px] font-medium leading-relaxed">
                  SpecCraft AI never automatically downloads models. If not yet installed, execute in PowerShell:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-300 flex justify-between">
                    <span>ollama pull llama3:latest</span>
                    <span className="text-[10px] text-amber-700 font-sans font-bold">Default</span>
                  </div>
                  <div className="bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-300 flex justify-between">
                    <span>ollama pull codellama:latest</span>
                    <span className="text-[10px] text-amber-700 font-sans font-bold">Alternative</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Model Comparison Scoreboard */}
          <div className="border-2 border-emerald-100 dark:border-emerald-950 rounded-3xl bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-emerald-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/40 to-teal-50/30">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <h2 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Model Comparison Scoreboard (Fixed: {fixedStrategyForModelComparison})
                </h2>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded-full">
                Independent Experiment Stream
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-emerald-50/80 border-b-2 border-emerald-100 text-slate-800 font-black">
                  <tr>
                    <th className="py-3 px-4 font-black">Model Name</th>
                    <th className="py-3 px-3 font-black text-right">Cases</th>
                    <th className="py-3 px-3 font-black text-right">Req Coverage %</th>
                    <th className="py-3 px-3 font-black text-right">Schema Validity %</th>
                    <th className="py-3 px-3 font-black text-right">Completeness %</th>
                    <th className="py-3 px-3 font-black text-right">Wall Clock (s)</th>
                    <th className="py-3 px-3 font-black text-right">Load Time (ms)</th>
                    <th className="py-3 px-3 font-black text-right">Speed (tok/s)</th>
                    <th className="py-3 px-3 font-black text-right">Prompt / Eval Tokens</th>
                    <th className="py-3 px-4 font-black text-center">Inspect Output</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100">
                  {/* Llama 3 */}
                  <tr className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900 flex items-center gap-2">
                      <span className="text-base">🦙</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 font-mono">llama3:latest</span>
                          <span className="text-[10px] bg-violet-600 text-white px-2 py-0.5 rounded-full font-black uppercase">Default</span>
                        </div>
                        <div className="text-[10px] text-slate-600 font-semibold">Fast general reasoning & semantic test design</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900">{llama3Result ? llama3Result.metrics.total_test_cases : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-emerald-700 bg-emerald-50/60 rounded px-1.5">{llama3Result ? `${llama3Result.metrics.requirement_coverage_pct}%` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900">{llama3Result ? `${llama3Result.metrics.schema_validity_pct}%` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900">{llama3Result ? `${llama3Result.metrics.completeness_pct}%` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-700">{llama3Result ? `${llama3Result.metrics.generation_time_seconds}s` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-700">{llama3Result?.metrics.load_duration_ms ? `${llama3Result.metrics.load_duration_ms}ms` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-700">{llama3Result?.metrics.tokens_per_second ? `${llama3Result.metrics.tokens_per_second}` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700 font-semibold">{llama3Result ? `${llama3Result.metrics.prompt_tokens || '—'} / ${llama3Result.metrics.completion_tokens || '—'}` : '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      {llama3Result && (
                        <button
                          onClick={() => onInspectPrompt('llama3:latest', llama3Result.prompt_used, llama3Result.raw_response)}
                          className="p-1.5 text-emerald-800 hover:bg-emerald-100 rounded-lg transition-colors font-bold"
                          title="Inspect Output"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* CodeLlama */}
                  <tr className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900 flex items-center gap-2">
                      <span className="text-base">💻</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 font-mono">codellama:latest</span>
                          <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-black uppercase">Alternative</span>
                        </div>
                        <div className="text-[10px] text-slate-600 font-semibold">Code-focused, strict boundary assertions</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900">{codellamaResult ? codellamaResult.metrics.total_test_cases : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-teal-700 bg-teal-50/60 rounded px-1.5">{codellamaResult ? `${codellamaResult.metrics.requirement_coverage_pct}%` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900">{codellamaResult ? `${codellamaResult.metrics.schema_validity_pct}%` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-black text-slate-900">{codellamaResult ? `${codellamaResult.metrics.completeness_pct}%` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-700">{codellamaResult ? `${codellamaResult.metrics.generation_time_seconds}s` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-700">{codellamaResult?.metrics.load_duration_ms ? `${codellamaResult.metrics.load_duration_ms}ms` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono font-bold text-teal-700">{codellamaResult?.metrics.tokens_per_second ? `${codellamaResult.metrics.tokens_per_second}` : '—'}</td>
                    <td className="py-3.5 px-3 text-right font-mono text-slate-700 font-semibold">{codellamaResult ? `${codellamaResult.metrics.prompt_tokens || '—'} / ${codellamaResult.metrics.completion_tokens || '—'}` : '—'}</td>
                    <td className="py-3.5 px-4 text-center">
                      {codellamaResult && (
                        <button
                          onClick={() => onInspectPrompt('codellama:latest', codellamaResult.prompt_used, codellamaResult.raw_response)}
                          className="p-1.5 text-teal-800 hover:bg-teal-100 rounded-lg transition-colors font-bold"
                          title="Inspect Output"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Model Case Comparison Tabs */}
          {modelComparisonResults && (
            <div className="border-2 border-emerald-100 dark:border-emerald-950 rounded-3xl p-5 bg-white dark:bg-slate-900 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-emerald-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveModelTab('llama3:latest')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeModelTab === 'llama3:latest'
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'bg-violet-50 text-violet-800 hover:bg-violet-100'
                    }`}
                  >
                    🦙 llama3:latest ({llama3Result?.parsed_test_cases.length || 0} Cases)
                  </button>
                  <button
                    onClick={() => setActiveModelTab('codellama:latest')}
                    className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                      activeModelTab === 'codellama:latest'
                        ? 'bg-teal-600 text-white shadow-xs'
                        : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                    }`}
                  >
                    💻 codellama:latest ({codellamaResult?.parsed_test_cases.length || 0} Cases)
                  </button>
                </div>

                {activeModelResult && (
                  <button
                    onClick={() =>
                      onInspectPrompt(
                        activeModelTab,
                        activeModelResult.prompt_used,
                        activeModelResult.raw_response
                      )
                    }
                    className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Model Response</span>
                  </button>
                )}
              </div>

              {activeModelResult && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {activeModelResult.parsed_test_cases.map((tc) => (
                    <div
                      key={tc.test_id}
                      className="p-3.5 rounded-2xl border-2 border-emerald-50 dark:border-slate-800 bg-emerald-50/20 dark:bg-slate-800/40 text-xs flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono font-black text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            {tc.test_id}
                          </span>
                          <span className="font-mono text-teal-900 font-bold bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                            {(tc.requirement_ids || []).join(', ')}
                          </span>
                          <span className="font-black text-slate-900 text-xs">
                            {tc.title}
                          </span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-200">
                            {tc.category}
                          </span>
                        </div>

                        <p className="text-slate-800 text-xs leading-relaxed">
                          <strong className="text-emerald-950 font-black">Expected Result:</strong> {tc.expected_result}
                        </p>

                        {tc.test_data && (
                          <div className="text-[11px] text-slate-700 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                            <strong>Test Fixture:</strong> {tc.test_data}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
