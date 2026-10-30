/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TestCase, ReviewStatus } from '../../types';
import {
  X,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Flag,
  Save,
  Check,
} from 'lucide-react';

interface TestCaseModalProps {
  testCase: TestCase | null;
  onClose: () => void;
  onSaveTestCase: (updatedCase: TestCase) => void;
}

export const TestCaseModal: React.FC<TestCaseModalProps> = ({
  testCase,
  onClose,
  onSaveTestCase,
}) => {
  if (!testCase) return null;

  const [title, setTitle] = useState(testCase.title);
  const [category, setCategory] = useState(testCase.category);
  const [priority, setPriority] = useState(testCase.priority);
  const [stepsText, setStepsText] = useState((testCase.steps || []).join('\n'));
  const [preconditionsText, setPreconditionsText] = useState((testCase.preconditions || []).join('\n'));
  const [testData, setTestData] = useState(testCase.test_data || '');
  const [expectedResult, setExpectedResult] = useState(testCase.expected_result);
  const [assumptionsText, setAssumptionsText] = useState((testCase.assumptions || []).join('\n'));
  const [humanReviewStatus, setHumanReviewStatus] = useState<ReviewStatus>(testCase.human_review_status || 'unreviewed');
  const [humanNotes, setHumanNotes] = useState(testCase.human_notes || '');
  const [flaggedUnsupported, setFlaggedUnsupported] = useState(testCase.flagged_unsupported_assumptions || false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSave = () => {
    const updated: TestCase = {
      ...testCase,
      title: title.trim(),
      category: category.trim(),
      priority: priority.trim(),
      steps: stepsText.split('\n').map((s) => s.trim()).filter(Boolean),
      preconditions: preconditionsText.split('\n').map((p) => p.trim()).filter(Boolean),
      test_data: testData.trim(),
      expected_result: expectedResult.trim(),
      assumptions: assumptionsText.split('\n').map((a) => a.trim()).filter(Boolean),
      human_review_status: humanReviewStatus,
      human_notes: humanNotes.trim() || null,
      flagged_unsupported_assumptions: flaggedUnsupported,
    };
    onSaveTestCase(updated);
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-2 border-violet-100 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-violet-100 bg-gradient-to-r from-violet-50/70 via-white to-emerald-50/70">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-black bg-violet-100 text-violet-800 px-2.5 py-1 rounded-xl">
              {testCase.test_id}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              {(testCase.requirement_ids || []).join(', ')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Fields */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Test Case Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs font-bold px-3.5 py-2.5 bg-slate-50 border-2 border-violet-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Category & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border-2 border-violet-100 rounded-2xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="positive">Positive (Happy Path)</option>
                <option value="negative">Negative (Error Handling)</option>
                <option value="boundary">Boundary (Limit Testing)</option>
                <option value="validation">Validation (Data Check)</option>
                <option value="security">Security (Tokens / Lockout)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full text-xs font-bold bg-slate-50 border-2 border-violet-100 rounded-2xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Preconditions */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Preconditions (One per line)
            </label>
            <textarea
              rows={2}
              value={preconditionsText}
              onChange={(e) => setPreconditionsText(e.target.value)}
              className="w-full text-xs font-medium px-3.5 py-2 bg-slate-50 border-2 border-violet-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Steps */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Execution Steps (One step per line)
            </label>
            <textarea
              rows={3}
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              className="w-full text-xs font-mono font-medium px-3.5 py-2 bg-slate-50 border-2 border-violet-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Test Data */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">
              Test Data / Inputs
            </label>
            <input
              type="text"
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              className="w-full text-xs font-mono font-medium px-3.5 py-2 bg-slate-50 border-2 border-violet-100 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Expected Result */}
          <div>
            <label className="block text-xs font-black text-emerald-900 mb-1.5">
              Predicted Expected Result / Assertion
            </label>
            <textarea
              rows={2}
              value={expectedResult}
              onChange={(e) => setExpectedResult(e.target.value)}
              className="w-full text-xs font-bold px-3.5 py-2 bg-emerald-50/50 border-2 border-emerald-200 rounded-2xl text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* Assumptions */}
          <div>
            <label className="block text-xs font-black text-amber-900 mb-1.5">
              Stated Generator Assumptions (One per line)
            </label>
            <textarea
              rows={2}
              value={assumptionsText}
              onChange={(e) => setAssumptionsText(e.target.value)}
              placeholder="e.g. Assumed lockout threshold parameter defaults to 3 attempts..."
              className="w-full text-xs font-medium px-3.5 py-2 bg-amber-50/60 border-2 border-amber-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {/* Human Review Panel */}
          <div className="p-4 rounded-3xl border-2 border-violet-100 bg-violet-50/30 space-y-3">
            <span className="text-xs font-black text-violet-950 uppercase tracking-wider block">
              Human Evaluation Workflow
            </span>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setHumanReviewStatus('acceptable')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  humanReviewStatus === 'acceptable'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border-2 border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Acceptable</span>
              </button>
              <button
                type="button"
                onClick={() => setHumanReviewStatus('needs_improvement')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  humanReviewStatus === 'needs_improvement'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white border-2 border-amber-200 text-amber-800 hover:bg-amber-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Needs Improvement</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setHumanReviewStatus('incorrect');
                  setFlaggedUnsupported(true);
                }}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  humanReviewStatus === 'incorrect'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white border-2 border-red-200 text-red-800 hover:bg-red-50'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span>Incorrect</span>
              </button>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-red-700 font-bold">
                <input
                  type="checkbox"
                  checked={flaggedUnsupported}
                  onChange={(e) => setFlaggedUnsupported(e.target.checked)}
                  className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                />
                <Flag className="w-3.5 h-3.5" />
                <span>Flag Unsupported Assumption (Hallucination Detected)</span>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Human Review Notes
              </label>
              <input
                type="text"
                value={humanNotes}
                onChange={(e) => setHumanNotes(e.target.value)}
                placeholder="Reviewer rationale or comments..."
                className="w-full text-xs font-medium px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-violet-100 flex items-center justify-between bg-violet-50/20">
          <span className="text-xs font-bold text-slate-600">
            {isSavedNotice ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Saved & Re-evaluated!
              </span>
            ) : (
              'Changes update evaluation metrics'
            )}
          </span>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Re-evaluate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
