/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  TestCase,
  ReviewStatus,
  ExperimentRecord,
} from '../../types';
import { ApiService } from '../../services/api';
import {
  Search,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Flag,
  Sparkles,
} from 'lucide-react';

interface TestCaseExplorerProps {
  currentExperiment: ExperimentRecord | null;
  onUpdateHumanReview: (
    strategyId: string,
    testId: string,
    status: ReviewStatus,
    notes?: string,
    flagged?: boolean
  ) => void;
  onSelectTestCaseForInspection: (tc: TestCase) => void;
}

export const TestCaseExplorer: React.FC<TestCaseExplorerProps> = ({
  currentExperiment,
  onUpdateHumanReview,
  onSelectTestCaseForInspection,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedReviewStatus, setSelectedReviewStatus] = useState<string>('all');

  // Collect all test cases across all strategies
  const allCases = useMemo(() => {
    if (!currentExperiment) return [];
    const cases: TestCase[] = [];
    for (const [stratId, stratRes] of Object.entries(currentExperiment.strategy_results)) {
      for (const tc of stratRes.parsed_test_cases) {
        cases.push({
          ...tc,
          strategy_id: stratId,
        });
      }
    }
    return cases;
  }, [currentExperiment]);

  // Filtered cases
  const filteredCases = useMemo(() => {
    return allCases.filter((tc) => {
      if (selectedStrategy !== 'all' && tc.strategy_id !== selectedStrategy) return false;
      if (selectedCategory !== 'all' && tc.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (selectedReviewStatus !== 'all' && (tc.human_review_status || 'unreviewed') !== selectedReviewStatus) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = tc.title.toLowerCase().includes(query);
        const matchesId = tc.test_id.toLowerCase().includes(query);
        const matchesExp = tc.expected_result.toLowerCase().includes(query);
        const matchesReq = (tc.requirement_ids || []).some((r) => r.toLowerCase().includes(query));
        if (!matchesTitle && !matchesId && !matchesExp && !matchesReq) return false;
      }
      return true;
    });
  }, [allCases, selectedStrategy, selectedCategory, selectedReviewStatus, searchTerm]);

  const handleExportCsv = () => {
    ApiService.downloadCsv(filteredCases, `test_cases_${currentExperiment?.id || 'export'}.csv`);
  };

  const handleExportJson = () => {
    ApiService.downloadJson(
      {
        experiment_id: currentExperiment?.id,
        project_name: currentExperiment?.project_name,
        total_filtered_cases: filteredCases.length,
        test_cases: filteredCases,
      },
      `test_cases_${currentExperiment?.id || 'export'}.json`
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-2 border-violet-100 dark:border-violet-950 rounded-3xl p-6 bg-gradient-to-r from-violet-50/70 via-white to-emerald-50/70 dark:from-slate-900 dark:to-slate-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <span>Step 3 of 3</span>
            <span>·</span>
            <span>Test Case Explorer & Human Review</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Generated Software Test Cases
          </h1>
          <p className="text-xs text-slate-700 font-medium mt-0.5">
            Search, review assertions, flag assumptions, and export to CSV or JSON in 1 click.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={filteredCases.length === 0}
            className="px-4 py-2 text-xs font-black text-emerald-900 bg-emerald-100 border-2 border-emerald-300 rounded-2xl hover:bg-emerald-200 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleExportJson}
            disabled={filteredCases.length === 0}
            className="px-4 py-2 text-xs font-black text-violet-900 bg-violet-100 border-2 border-violet-300 rounded-2xl hover:bg-violet-200 disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="border-2 border-violet-100 rounded-3xl p-4 bg-white space-y-3 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-violet-600 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search test title, requirement ID, expected assertion..."
              className="w-full text-xs font-medium pl-9 pr-3 py-2 bg-violet-50/40 border-2 border-violet-200 rounded-2xl text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Strategy filter */}
          <div>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full text-xs bg-violet-50/40 border-2 border-violet-200 rounded-2xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-violet-400"
            >
              <option value="all">All Strategies</option>
              <option value="strategy_a">🐣 Strategy A (Basic)</option>
              <option value="strategy_b">📋 Strategy B (Structured)</option>
              <option value="strategy_c">🚀 Strategy C (Few-Shot)</option>
            </select>
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-emerald-50/40 border-2 border-emerald-200 rounded-2xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="all">All Categories</option>
              <option value="positive">Positive (Happy Path)</option>
              <option value="negative">Negative (Errors)</option>
              <option value="boundary">Boundary (Limits)</option>
              <option value="validation">Validation (Format)</option>
              <option value="security">Security (Lockout/Tokens)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-700 font-bold pt-1">
          <span>
            Showing <strong className="text-violet-800 font-black">{filteredCases.length}</strong> of {allCases.length} generated test cases
          </span>
          {(searchTerm || selectedStrategy !== 'all' || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStrategy('all');
                setSelectedCategory('all');
              }}
              className="text-violet-700 font-black hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Test Cases Cards Grid */}
      <div className="space-y-3">
        {filteredCases.length === 0 ? (
          <div className="border-2 border-dashed border-violet-200 rounded-3xl p-12 text-center text-xs font-bold text-slate-600 bg-white">
            No test cases match your search. Try changing filters or running the Prompt Lab!
          </div>
        ) : (
          filteredCases.map((tc) => {
            const isStratB = tc.strategy_id === 'strategy_b';
            const isStratC = tc.strategy_id === 'strategy_c';
            const stratBadge = isStratB
              ? '📋 Strategy B (Structured)'
              : isStratC
              ? '🚀 Strategy C (Few-Shot)'
              : '🐣 Strategy A (Basic)';

            const reviewStatus = tc.human_review_status || 'unreviewed';

            return (
              <div
                key={`${tc.strategy_id}-${tc.test_id}`}
                className="border-2 border-slate-200 hover:border-violet-300 rounded-2xl p-4.5 bg-white shadow-2xs transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-violet-900 bg-violet-100 px-2.5 py-0.5 rounded-lg border border-violet-200">
                      {tc.test_id}
                    </span>
                    <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      {stratBadge}
                    </span>
                    <span className="font-mono text-xs font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {(tc.requirement_ids || []).join(', ') || 'Unlinked'}
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                      {tc.category}
                    </span>
                  </div>

                  {/* Human Review buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      onClick={() =>
                        onUpdateHumanReview(tc.strategy_id || 'strategy_a', tc.test_id, 'acceptable')
                      }
                      title="Acceptable (Valid test)"
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                        reviewStatus === 'acceptable'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>

                    <button
                      onClick={() =>
                        onUpdateHumanReview(tc.strategy_id || 'strategy_a', tc.test_id, 'needs_improvement')
                      }
                      title="Needs Improvement"
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                        reviewStatus === 'needs_improvement'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Review</span>
                    </button>

                    <button
                      onClick={() =>
                        onUpdateHumanReview(tc.strategy_id || 'strategy_a', tc.test_id, 'incorrect', undefined, true)
                      }
                      title="Incorrect / Flag Unsupported Assumption"
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1 ${
                        reviewStatus === 'incorrect'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-red-50 text-red-900 border border-red-300 hover:bg-red-100'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Flag</span>
                    </button>

                    <button
                      onClick={() => onSelectTestCaseForInspection(tc)}
                      className="p-1.5 text-slate-600 hover:text-violet-700 rounded-lg hover:bg-violet-100 transition-colors ml-1"
                      title="Edit Steps & Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-sm font-black text-slate-900">
                  {tc.title}
                </h3>

                {/* Predicted Assert */}
                <div className="text-xs text-slate-800 bg-slate-50/80 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  <strong className="text-violet-950 font-black">Expected Assertion: </strong>
                  {tc.expected_result}
                </div>

                {/* Assumptions or Flagged Hallucination */}
                {tc.assumptions && tc.assumptions.length > 0 && (
                  <div className="text-xs text-amber-950 bg-amber-50 p-2.5 rounded-xl border border-amber-300 flex items-center justify-between">
                    <span>
                      ⚠️ <strong>Stated Assumption:</strong> {tc.assumptions.join('; ')}
                    </span>
                    {tc.flagged_unsupported_assumptions && (
                      <span className="text-[10px] font-black text-red-700 bg-red-100 border border-red-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Flag className="w-3 h-3" /> Flagged Unsupported
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
