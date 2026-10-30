/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ViewTab } from '../types';
import { Play, Sun, Moon, Sparkles, Wand2 } from 'lucide-react';

interface TopBarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onRunBenchmark: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onTabChange,
  onRunBenchmark,
  isDark,
  onToggleTheme,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3 border-b-2 border-violet-100 dark:border-violet-950 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 shadow-xs">
      {/* Zone 1: Friendly brand wordmark with cartoon mascot mark */}
      <a
        href="#dashboard"
        onClick={(e) => {
          e.preventDefault();
          onTabChange('dashboard');
        }}
        className="flex items-center gap-2.5 text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 group"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-emerald-400 p-0.5 shadow-sm transform group-hover:rotate-6 transition-transform">
          <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
            <span className="text-sm">🤖</span>
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-violet-600 dark:text-violet-400 font-black text-lg">SpecCraft</span>
          <span className="text-emerald-500 font-extrabold text-base">AI</span>
        </div>
      </a>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-800">
        <button
          onClick={() => onTabChange('dashboard')}
          className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
            currentTab === 'dashboard'
              ? 'bg-violet-100 text-violet-800 font-extrabold shadow-xs'
              : 'text-slate-700 hover:text-violet-700 hover:bg-violet-50'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => onTabChange('requirements')}
          className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
            currentTab === 'requirements'
              ? 'bg-emerald-100 text-emerald-900 font-extrabold shadow-xs'
              : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          Requirements
        </button>
        <button
          onClick={() => onTabChange('prompt_lab')}
          className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
            currentTab === 'prompt_lab'
              ? 'bg-violet-100 text-violet-800 font-extrabold shadow-xs'
              : 'text-slate-700 hover:text-violet-700 hover:bg-violet-50'
          }`}
        >
          Prompt Lab
        </button>
        <button
          onClick={() => onTabChange('test_cases')}
          className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
            currentTab === 'test_cases'
              ? 'bg-emerald-100 text-emerald-900 font-extrabold shadow-xs'
              : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50'
          }`}
        >
          Test Cases
        </button>
        <button
          onClick={() => onTabChange('analytics')}
          className={`px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap shrink-0 ${
            currentTab === 'analytics'
              ? 'bg-violet-100 text-violet-800 font-extrabold shadow-xs'
              : 'text-slate-700 hover:text-violet-700 hover:bg-violet-50'
          }`}
        >
          Analytics
        </button>
      </nav>

      {/* Zone 3: 1 primary action & theme switch */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
          className="p-2 text-slate-500 hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-300 rounded-xl hover:bg-violet-50 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-500" />}
        </button>
        <button
          onClick={onRunBenchmark}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-500 to-violet-600 rounded-xl hover:from-emerald-600 hover:to-violet-700 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run 3-Way Comparison</span>
        </button>
      </div>
    </header>
  );
};
