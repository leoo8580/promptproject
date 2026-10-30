/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ProjectRequirements,
  RequirementItem,
} from '../../types';
import { SAMPLE_DATASETS } from '../../data/sampleRequirements';
import {
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface RequirementsWorkspaceProps {
  requirements: ProjectRequirements;
  onChangeRequirements: (updated: ProjectRequirements) => void;
  onProceedToPromptLab: () => void;
}

export const RequirementsWorkspace: React.FC<RequirementsWorkspaceProps> = ({
  requirements,
  onChangeRequirements,
  onProceedToPromptLab,
}) => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>('user-login');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCriteria, setNewCriteria] = useState('');
  const [isUnresolved, setIsUnresolved] = useState(false);
  const [unresolvedNote, setUnresolvedNote] = useState('');
  const [newAssumption, setNewAssumption] = useState('');

  // Handle sample dataset change
  const handleSelectSample = (sampleId: string) => {
    setSelectedSampleId(sampleId);
    const found = SAMPLE_DATASETS.find((s) => s.id === sampleId);
    if (found) {
      onChangeRequirements(JSON.parse(JSON.stringify(found.data)));
    }
  };

  // Generate next REQ ID
  const getNextReqId = () => {
    const existingNums = requirements.requirements
      .map((r) => {
        const match = r.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
    return `REQ-${String(nextNum).padStart(3, '0')}`;
  };

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const id = getNextReqId();
    const criteriaList = newCriteria
      .split('\n')
      .map((c) => c.trim())
      .filter((c) => c.length > 0);

    const newItem: RequirementItem = {
      id,
      title: newTitle.trim(),
      description: newDesc.trim(),
      acceptance_criteria: criteriaList,
      is_unresolved: isUnresolved,
      unresolved_note: isUnresolved ? unresolvedNote.trim() : null,
    };

    onChangeRequirements({
      ...requirements,
      requirements: [...requirements.requirements, newItem],
    });

    setNewTitle('');
    setNewDesc('');
    setNewCriteria('');
    setIsUnresolved(false);
    setUnresolvedNote('');
  };

  const handleDeleteRequirement = (id: string) => {
    onChangeRequirements({
      ...requirements,
      requirements: requirements.requirements.filter((r) => r.id !== id),
    });
  };

  const handleAddAssumption = () => {
    if (!newAssumption.trim()) return;
    onChangeRequirements({
      ...requirements,
      system_assumptions: [...requirements.system_assumptions, newAssumption.trim()],
    });
    setNewAssumption('');
  };

  const handleDeleteAssumption = (index: number) => {
    const updated = [...requirements.system_assumptions];
    updated.splice(index, 1);
    onChangeRequirements({
      ...requirements,
      system_assumptions: updated,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Friendly Header with 1-Click Preset Buttons */}
      <div className="border-2 border-violet-100 dark:border-violet-950 rounded-3xl p-6 bg-gradient-to-r from-violet-50/60 via-white to-emerald-50/60 dark:from-slate-900 dark:to-slate-900 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-violet-700 dark:text-violet-300">
              <span>Step 1 of 3</span>
              <span>·</span>
              <span>Define Specification</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Software Requirements Workspace
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Choose a preset dataset or add your own software requirements with acceptance criteria.
            </p>
          </div>

          <button
            onClick={onProceedToPromptLab}
            className="px-5 py-2.5 text-xs font-black text-white bg-gradient-to-r from-violet-600 to-emerald-500 rounded-2xl shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <span>Proceed to Prompt Lab</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 1-Click Quick Dataset Pills */}
        <div className="pt-2 border-t-2 border-violet-100">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
            Load Quick Preset:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_DATASETS.map((s) => {
              const isSelected = selectedSampleId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s.id)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-violet-600 text-white shadow-xs scale-[1.02]'
                      : 'bg-white border-2 border-violet-200 text-slate-800 hover:bg-violet-50'
                  }`}
                >
                  <span>{s.id === 'user-login' ? '🔐' : s.id === 'shopping-checkout' ? '🛒' : s.id === 'library-borrowing' ? '📚' : s.id === 'leave-management' ? '🏖️' : '🔑'}</span>
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Left side Requirements List, Right side Add & Assumptions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Active Requirements List */}
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span>Active Requirements</span>
              <span className="bg-violet-100 text-violet-900 px-2.5 py-0.5 rounded-full text-xs font-black border border-violet-200">
                {requirements.requirements.length}
              </span>
            </h2>
            <span className="text-xs font-bold text-slate-700">
              Target Project: <span className="font-black text-violet-900">{requirements.project_name}</span>
            </span>
          </div>

          <div className="space-y-3">
            {requirements.requirements.map((req) => (
              <div
                key={req.id}
                className={`border-2 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-2xs transition-all ${
                  req.is_unresolved
                    ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/20'
                    : 'border-emerald-100 dark:border-slate-800 hover:border-emerald-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-lg">
                        {req.id}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {req.title}
                      </h3>
                      {req.is_unresolved && (
                        <span className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1 font-bold bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Unresolved Policy (Anti-Hallucination Target)
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-800 font-medium leading-relaxed">
                      {req.description}
                    </p>

                    {req.acceptance_criteria && req.acceptance_criteria.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <span className="text-[11px] font-black text-slate-700 uppercase tracking-wide block mb-1">
                          Acceptance Criteria:
                        </span>
                        <ul className="text-xs text-slate-800 font-medium space-y-1">
                          {req.acceptance_criteria.map((c, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-600 font-bold">✓</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {req.is_unresolved && req.unresolved_note && (
                      <div className="mt-2 p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-xs text-amber-950 font-medium">
                        <span className="font-black block mb-0.5">⚠️ Unresolved Policy Note:</span>
                        {req.unresolved_note}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteRequirement(req.id)}
                    aria-label={`Delete ${req.id}`}
                    className="text-slate-300 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side: Add Requirement & Assumptions */}
        <div className="space-y-5">
          {/* Add New Requirement Card */}
          <div className="border-2 border-violet-100 rounded-3xl p-5 bg-white shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <h3 className="text-xs font-black text-violet-950 uppercase tracking-wider">
                Add Custom Requirement ({getNextReqId()})
              </h3>
            </div>

            <form onSubmit={handleAddRequirement} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Session timeout after inactivity"
                  className="w-full text-xs font-medium px-3 py-2 bg-violet-50/40 border-2 border-violet-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe the expected software behavior..."
                  className="w-full text-xs font-medium px-3 py-2 bg-violet-50/40 border-2 border-violet-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  Acceptance Criteria (One per line)
                </label>
                <textarea
                  rows={2}
                  value={newCriteria}
                  onChange={(e) => setNewCriteria(e.target.value)}
                  placeholder="Given X, when Y, then Z..."
                  className="w-full text-xs font-medium px-3 py-2 bg-violet-50/40 border-2 border-violet-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />
              </div>

              {/* Unresolved toggle */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-900 font-bold">
                  <input
                    type="checkbox"
                    checked={isUnresolved}
                    onChange={(e) => setIsUnresolved(e.target.checked)}
                    className="rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                  />
                  <span>Flag as Unresolved Policy (Test Anti-Hallucination)</span>
                </label>
              </div>

              {isUnresolved && (
                <div>
                  <input
                    type="text"
                    value={unresolvedNote}
                    onChange={(e) => setUnresolvedNote(e.target.value)}
                    placeholder="e.g. Threshold parameter omitted to test if AI hallucinates it..."
                    className="w-full text-xs font-medium px-3 py-2 bg-amber-50 border-2 border-amber-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={!newTitle.trim() || !newDesc.trim()}
                className="w-full py-2.5 text-xs font-black text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-40 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add {getNextReqId()}</span>
              </button>
            </form>
          </div>

          {/* System Assumptions */}
          <div className="border-2 border-emerald-100 rounded-3xl p-5 bg-white shadow-xs space-y-3">
            <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Stated Technical Assumptions</span>
            </h3>

            <div className="space-y-1.5">
              {requirements.system_assumptions.map((assump, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-slate-900 font-medium"
                >
                  <span className="text-xs">{assump}</span>
                  <button
                    onClick={() => handleDeleteAssumption(idx)}
                    className="text-slate-400 hover:text-red-600 p-0.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newAssumption}
                onChange={(e) => setNewAssumption(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAssumption()}
                placeholder="Add technical assumption..."
                className="flex-1 text-xs font-medium px-3 py-2 bg-emerald-50/40 border-2 border-emerald-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                type="button"
                onClick={handleAddAssumption}
                className="px-4 py-2 text-xs font-black text-emerald-950 bg-emerald-200 border border-emerald-300 rounded-xl hover:bg-emerald-300 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
