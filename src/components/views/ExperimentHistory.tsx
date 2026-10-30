/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ExperimentSummary,
} from '../../types';
import { ApiService } from '../../services/api';
import {
  Download,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface ExperimentHistoryProps {
  experiments: ExperimentSummary[];
  onLoadExperiment: (id: string) => Promise<void>;
  onRefreshHistory: () => Promise<void>;
  currentExperimentId?: string;
}

export const ExperimentHistory: React.FC<ExperimentHistoryProps> = ({
  experiments,
  onLoadExperiment,
  onRefreshHistory,
  currentExperimentId,
}) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSelect = async (id: string) => {
    setLoadingId(id);
    try {
      await onLoadExperiment(id);
    } finally {
      setLoadingId(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshHistory();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExportExperimentCsv = async (id: string) => {
    try {
      const exp = await ApiService.getExperiment(id);
      const allCases = [];
      for (const [stratId, stratRes] of Object.entries(exp.strategy_results)) {
        for (const tc of stratRes.parsed_test_cases) {
          allCases.push({ ...tc, strategy_id: stratId });
        }
      }
      ApiService.downloadCsv(allCases, `experiment_${id}_cases.csv`);
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="border-2 border-violet-100 dark:border-violet-950 rounded-3xl p-6 bg-gradient-to-r from-violet-50/70 via-white to-emerald-50/70 dark:from-slate-900 dark:to-slate-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-300">
            <span>Audit Trail</span>
            <span>·</span>
            <span>Local Experiment Storage</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Saved Experiment Runs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Locally stored in <code>data/experiments/</code>.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 text-xs font-bold text-violet-800 dark:text-violet-200 bg-white dark:bg-slate-800 border-2 border-violet-200 dark:border-slate-700 rounded-2xl hover:bg-violet-50 transition-all flex items-center gap-1.5 self-start md:self-auto shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-violet-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Table */}
      <div className="border-2 border-violet-100 rounded-3xl bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-violet-50/80 border-b-2 border-violet-100 text-slate-800 font-black">
              <tr>
                <th className="py-3 px-4 font-black">Experiment ID</th>
                <th className="py-3 px-4 font-black">Project Specification</th>
                <th className="py-3 px-3 font-black">Model</th>
                <th className="py-3 px-3 font-black text-right">Test Cases</th>
                <th className="py-3 px-4 font-black">Timestamp</th>
                <th className="py-3 px-4 font-black text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-violet-100">
              {experiments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs font-bold text-slate-600">
                    No experiments saved yet. Run the Prompt Lab to create records!
                  </td>
                </tr>
              ) : (
                experiments.map((exp) => {
                  const isCurrent = exp.id === currentExperimentId;

                  if (exp.is_corrupted) {
                    return (
                      <tr key={exp.id} className="bg-red-50">
                        <td className="py-3 px-4 font-mono text-red-700 font-black">{exp.id}</td>
                        <td className="py-3 px-4 text-red-800 flex items-center gap-1.5 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Corrupted File: {exp.filename}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">—</td>
                        <td className="py-3 px-3 text-right font-mono text-slate-500">0</td>
                        <td className="py-3 px-4 text-slate-500">Corrupted</td>
                        <td className="py-3 px-4 text-center text-slate-500 font-bold">Safely Handled</td>
                      </tr>
                    );
                  }

                  return (
                    <tr
                      key={exp.id}
                      className={`hover:bg-violet-50/40 transition-colors ${
                        isCurrent ? 'bg-violet-50/60 font-semibold' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-black text-violet-950">
                        {exp.id}
                        {isCurrent && (
                          <span className="ml-2 text-[10px] text-emerald-950 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-black">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-bold">
                        <div>{exp.project_name}</div>
                        <span className={`inline-block mt-0.5 text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                          exp.experiment_type === 'model_comparison'
                            ? 'bg-teal-100 text-teal-900 border border-teal-300'
                            : 'bg-violet-100 text-violet-900 border border-violet-200'
                        }`}>
                          {exp.experiment_type === 'model_comparison' ? '🤖 Model Comparison' : '🧪 Prompt Strategy'}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-800 font-bold">
                        {exp.model_name}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                        {exp.total_test_cases}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {exp.timestamp}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleSelect(exp.id)}
                            disabled={loadingId === exp.id}
                            className={`px-3 py-1 text-xs font-black rounded-xl transition-all ${
                              isCurrent
                                ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                : 'bg-violet-600 text-white hover:bg-violet-700 shadow-2xs'
                            }`}
                          >
                            {loadingId === exp.id ? 'Loading...' : isCurrent ? 'Active' : 'Load Run'}
                          </button>
                          <button
                            onClick={() => handleExportExperimentCsv(exp.id)}
                            title="Export Cases to CSV"
                            className="p-1.5 text-slate-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
