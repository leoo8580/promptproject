/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  FileCode2,
  FlaskConical,
  ListTodo,
  BarChart3,
  History,
  Settings,
  Server,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ViewTab, OllamaStatus } from '../types';

interface SidebarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  ollamaStatus: OllamaStatus | null;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  ollamaStatus,
  onOpenSettings,
}) => {
  const navItems: { id: ViewTab; label: string; icon: string; color: string }[] = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: '✨', color: 'text-violet-600' },
    { id: 'requirements', label: 'Requirements Workspace', icon: '📝', color: 'text-emerald-600' },
    { id: 'prompt_lab', label: 'Prompt Lab & Compare', icon: '🧪', color: 'text-violet-600' },
    { id: 'test_cases', label: 'Test Case Explorer', icon: '🔍', color: 'text-emerald-600' },
    { id: 'analytics', label: 'Evaluation & Analytics', icon: '📊', color: 'text-violet-600' },
    { id: 'experiments', label: 'Experiment History', icon: '📚', color: 'text-emerald-600' },
  ];

  return (
    <aside className="w-64 shrink-0 border-r-2 border-violet-100 dark:border-violet-950/60 bg-white dark:bg-slate-900 flex flex-col justify-between h-[calc(100vh-61px)] sticky top-[61px] select-none shadow-xs">
      <div>
        {/* Friendly Subtitle Header */}
        <div className="px-5 py-4 border-b border-violet-100 dark:border-violet-950/60 flex items-center justify-between bg-gradient-to-r from-violet-50/70 to-emerald-50/50 dark:from-slate-800/40 dark:to-slate-800/20">
          <div>
            <div className="text-xs font-bold text-violet-800 dark:text-violet-300 flex items-center gap-1.5">
              <span>Prompt QA Testbed</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 fill-emerald-300" />
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Empirical Evaluation Suite
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold rounded-xl transition-all text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-100 to-emerald-50 text-violet-950 border-2 border-violet-300 shadow-xs'
                    : 'text-slate-800 hover:text-violet-900 hover:bg-violet-50/80'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Ollama Connection & Settings Footnote */}
      <div className="p-3 border-t-2 border-violet-100 space-y-2 bg-gradient-to-b from-transparent to-violet-50/40">
        <div
          onClick={onOpenSettings}
          className="p-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100/80 cursor-pointer transition-colors shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-600" />
              Ollama Engine
            </span>
            {ollamaStatus?.reachable ? (
              <span className="text-emerald-800 font-bold flex items-center gap-1 text-[11px] bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live
              </span>
            ) : (
              <span className="text-amber-900 font-bold flex items-center gap-1 text-[11px] bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                <AlertCircle className="w-3 h-3 text-amber-600" /> Standby
              </span>
            )}
          </div>
          <div className="text-[11px] text-emerald-900 font-medium truncate">
            Model: <span className="font-mono font-bold text-emerald-950">{ollamaStatus?.selected_model || 'qwen2.5:3b'}</span>
          </div>
        </div>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-violet-800 hover:text-violet-950 rounded-xl hover:bg-violet-100/70 transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-violet-600" />
          <span>Connection Settings</span>
        </button>
      </div>
    </aside>
  );
};
