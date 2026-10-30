/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ExperimentRecord,
  ViewTab,
  ProjectRequirements,
} from '../../types';
import { CartoonMascot } from '../CartoonMascot';
import {
  ArrowRight,
  ShieldAlert,
  Sparkles,
  BarChart,
  FileCheck2,
  Layers,
  Award,
  Zap,
  CheckCircle,
} from 'lucide-react';

interface DashboardOverviewProps {
  currentExperiment: ExperimentRecord | null;
  currentRequirements: ProjectRequirements;
  onNavigate: (tab: ViewTab) => void;
  onRunComparison: () => void;
  onLoadBenchmark: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  currentExperiment,
  currentRequirements,
  onNavigate,
  onRunComparison,
  onLoadBenchmark,
}) => {
  const stratA = currentExperiment?.strategy_results?.strategy_a;
  const stratB = currentExperiment?.strategy_results?.strategy_b;
  const stratC = currentExperiment?.strategy_results?.strategy_c;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Friendly Welcome Hero Banner with Cartoon Mascot */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-r from-violet-100/90 via-white to-emerald-100/80 border-2 border-violet-200/80 dark:border-violet-900 shadow-sm">
        {/* Playful cartoon decorative bubbles */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-200/40 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-32 h-32 bg-violet-200/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border-2 border-violet-200 text-xs font-black text-violet-800 shadow-xs">
              <Sparkles className="w-4 h-4 text-emerald-600 fill-emerald-400" />
              <span>Prompt Engineering & Test Quality Evaluation</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tight leading-snug">
              Compare How Prompts Change Test Case Quality!
            </h1>

            <p className="text-sm text-slate-800 font-medium leading-relaxed">
              Enter software requirements, run <span className="font-extrabold text-violet-800">3 prompt strategies</span> in 1 click, and watch how structured instructions prevent AI hallucinations and boost coverage!
            </p>

            {/* Quick 1-click action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={onRunComparison}
                className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Run 3-Way Comparison Now</span>
              </button>
              <button
                onClick={onLoadBenchmark}
                className="px-4 py-2.5 text-xs font-bold text-violet-800 dark:text-violet-200 bg-white/90 dark:bg-slate-800 border-2 border-violet-200 dark:border-violet-700 rounded-2xl hover:bg-violet-50 hover:border-violet-300 transition-all shadow-2xs"
              >
                🎯 Load Benchmark REQ-001–005
              </button>
            </div>
          </div>

          {/* Animated Cartoon Mascot */}
          <div className="shrink-0 flex justify-center lg:justify-end">
            <CartoonMascot
              mood={stratB?.metrics.requirement_coverage_pct === 100 ? 'celebrating' : 'happy'}
              speechText="Hi! I'm Crafty! Click 'Run 3-Way Comparison' to see how Basic vs Structured prompts perform!"
              size="lg"
            />
          </div>
        </div>
      </div>

      {/* 3 Strategy Comparison Cards (Simple, Visual, Clean) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
              Strategy Scoreboard Snapshot
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            {currentExperiment ? `Model: ${currentExperiment.model_name}` : 'Active Run'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Strategy A Card */}
          <div className="relative border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-5 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between hover:border-violet-200 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🐣</span>
                  <div>
                    <h3 className="font-black text-sm text-slate-900">Strategy A</h3>
                    <div className="text-[11px] font-bold text-slate-600">Basic Prompting</div>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">
                  Minimal
                </span>
              </div>

              <p className="text-xs text-slate-700 font-medium mb-4">
                Short prompt with no rules or boundary checks. Generates basic positive tests, but often misses security and edge cases.
              </p>

              <div className="space-y-2.5 text-xs bg-slate-100 rounded-2xl p-3.5 border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-bold">Req Coverage:</span>
                  <span className="font-mono font-extrabold text-amber-700 text-sm">
                    {stratA ? `${stratA.metrics.requirement_coverage_pct}%` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-bold">Completeness:</span>
                  <span className="font-mono font-extrabold text-slate-900">
                    {stratA ? `${stratA.metrics.completeness_pct}%` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-bold">Categories:</span>
                  <span className="font-mono font-extrabold text-slate-900">
                    {stratA ? `${stratA.metrics.categories_represented.length} of 5` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-bold">Time Taken:</span>
                  <span className="font-mono font-bold text-slate-700">
                    {stratA ? `${stratA.metrics.generation_time_seconds}s` : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-amber-800 font-bold">
              ⚠️ Often hallucinates unstated numbers on REQ-005.
            </div>
          </div>

          {/* Strategy B Card (Winner Badge!) */}
          <div className="relative border-2 border-emerald-300 rounded-3xl p-5 bg-gradient-to-b from-emerald-50 to-white shadow-md flex flex-col justify-between transform md:-translate-y-1 transition-all">
            <div className="absolute -top-3 right-5 bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              <span>Recommended</span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h3 className="font-black text-sm text-emerald-950">Strategy B</h3>
                    <div className="text-[11px] font-extrabold text-emerald-700">Structured Prompting</div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-800 font-medium mb-4">
                Explicit role, strict JSON schema, 5 test categories, and rules against inventing assumptions.
              </p>

              <div className="space-y-2.5 text-xs bg-emerald-100 rounded-2xl p-3.5 border border-emerald-200">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-950 font-bold">Req Coverage:</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">
                    {stratB ? `${stratB.metrics.requirement_coverage_pct}%` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-950 font-bold">Completeness:</span>
                  <span className="font-mono font-black text-emerald-700">
                    {stratB ? `${stratB.metrics.completeness_pct}%` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-950 font-bold">Categories:</span>
                  <span className="font-mono font-black text-emerald-700">
                    {stratB ? `${stratB.metrics.categories_represented.length} of 5` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-950 font-bold">Time Taken:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {stratB ? `${stratB.metrics.generation_time_seconds}s` : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-200 text-[11px] text-emerald-900 font-extrabold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Schema Valid & Zero Hallucinated Thresholds</span>
            </div>
          </div>

          {/* Strategy C Card */}
          <div className="relative border-2 border-violet-200 rounded-3xl p-5 bg-gradient-to-b from-violet-50 to-white shadow-sm flex flex-col justify-between hover:border-violet-300 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <h3 className="font-black text-sm text-violet-950">Strategy C</h3>
                    <div className="text-[11px] font-extrabold text-violet-700">Few-Shot Prompting</div>
                  </div>
                </div>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-violet-200 text-violet-900">
                  Exemplar-Driven
                </span>
              </div>

              <p className="text-xs text-slate-800 font-medium mb-4">
                Structured constraints plus 2 reference examples demonstrating pristine assertions and assumption modeling.
              </p>

              <div className="space-y-2.5 text-xs bg-violet-100 rounded-2xl p-3.5 border border-violet-200">
                <div className="flex justify-between items-center">
                  <span className="text-violet-950 font-bold">Req Coverage:</span>
                  <span className="font-mono font-black text-violet-700 text-sm">
                    {stratC ? `${stratC.metrics.requirement_coverage_pct}%` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-violet-950 font-bold">Completeness:</span>
                  <span className="font-mono font-black text-violet-700">
                    {stratC ? `${stratC.metrics.completeness_pct}%` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-violet-950 font-bold">Categories:</span>
                  <span className="font-mono font-black text-violet-700">
                    {stratC ? `${stratC.metrics.categories_represented.length} of 5` : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-violet-950 font-bold">Time Taken:</span>
                  <span className="font-mono font-bold text-violet-800">
                    {stratC ? `${stratC.metrics.generation_time_seconds}s` : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-violet-200 text-[11px] text-violet-900 font-extrabold flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-violet-600" />
              <span>Highest Detail & In-Context Precision</span>
            </div>
          </div>
        </div>
      </div>

      {/* REQ-005 Benchmark Story Card (Simplified & User-Friendly) */}
      <div className="border-2 border-emerald-300 rounded-3xl p-6 bg-gradient-to-r from-emerald-50 via-white to-violet-50 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-emerald-600 text-white shrink-0 shadow-sm text-xl">
            💡
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-emerald-900 uppercase tracking-wide">
                Key Educational Takeaway
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-black text-violet-800">
                The REQ-005 Security Policy Experiment
              </span>
            </div>
            <h3 className="text-base font-black text-slate-950">
              How Prompts Prevent AI From Making Things Up
            </h3>
            <p className="text-xs text-slate-800 font-medium leading-relaxed">
              In requirement <strong>REQ-005</strong>, the lockout threshold (how many failed logins before account lock) is intentionally omitted from the specification.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border-2 border-slate-300 shadow-2xs">
                <span className="font-black text-slate-950 block mb-1">
                  ❌ Strategy A (Basic)
                </span>
                <span className="text-slate-800 font-medium text-[11px] leading-snug block">
                  Hallucinates "Locks account after 3 attempts" even though nobody specified 3!
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border-2 border-emerald-400 shadow-2xs">
                <span className="font-black text-emerald-950 block mb-1">
                  ✅ Strategy B (Structured)
                </span>
                <span className="text-slate-800 font-medium text-[11px] leading-snug block">
                  Flags the unstated threshold inside <code>assumptions</code> without hallucinating.
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border-2 border-violet-400 shadow-2xs">
                <span className="font-black text-violet-950 block mb-1">
                  ⭐ Strategy C (Few-Shot)
                </span>
                <span className="text-slate-800 font-medium text-[11px] leading-snug block">
                  Parametrically structures the test case, matching the few-shot demonstration.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Friendly 3-Column Navigation Jump */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('requirements')}
          className="p-5 border-2 border-violet-200 hover:border-violet-400 rounded-3xl bg-white text-left transition-all hover:scale-[1.01] shadow-2xs group"
        >
          <div className="flex items-center gap-2.5 text-sm font-black text-violet-950 mb-1">
            <span className="text-xl">📝</span>
            <span>1. View Requirements</span>
          </div>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            Manage your project specifications or pick from 5 ready-to-use sample datasets.
          </p>
        </button>

        <button
          onClick={() => onNavigate('prompt_lab')}
          className="p-5 border-2 border-emerald-200 hover:border-emerald-400 rounded-3xl bg-white text-left transition-all hover:scale-[1.01] shadow-2xs group"
        >
          <div className="flex items-center gap-2.5 text-sm font-black text-emerald-950 mb-1">
            <span className="text-xl">🧪</span>
            <span>2. Run Prompt Lab</span>
          </div>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            Execute Strategy A, B, and C with live timer, tokens, and prompt inspector.
          </p>
        </button>

        <button
          onClick={() => onNavigate('test_cases')}
          className="p-5 border-2 border-violet-200 hover:border-violet-400 rounded-3xl bg-white text-left transition-all hover:scale-[1.01] shadow-2xs group"
        >
          <div className="flex items-center gap-2.5 text-sm font-black text-violet-950 mb-1">
            <span className="text-xl">🔍</span>
            <span>3. Explore & Export Cases</span>
          </div>
          <p className="text-xs text-slate-700 font-medium leading-relaxed">
            Filter test cases, mark thumbs up/down, inspect assertions, and download CSV/JSON.
          </p>
        </button>
      </div>
    </div>
  );
};
