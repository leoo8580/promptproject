/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  ViewTab,
  ProjectRequirements,
  ExperimentRecord,
  ExperimentSummary,
  OllamaStatus,
  TestCase,
  ReviewStatus,
} from './types';
import { SAMPLE_DATASETS } from './data/sampleRequirements';
import { ApiService } from './services/api';

import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DashboardOverview } from './components/views/DashboardOverview';
import { RequirementsWorkspace } from './components/views/RequirementsWorkspace';
import { PromptLab } from './components/views/PromptLab';
import { TestCaseExplorer } from './components/views/TestCaseExplorer';
import { EvaluationAnalytics } from './components/views/EvaluationAnalytics';
import { ExperimentHistory } from './components/views/ExperimentHistory';
import { SettingsModal } from './components/views/SettingsModal';
import { TestCaseModal } from './components/views/TestCaseModal';
import { PromptInspectorModal } from './components/views/PromptInspectorModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [isDark, setIsDark] = useState<boolean>(false);

  // Active requirements in workspace (default to Benchmark dataset REQ-001–005)
  const [requirements, setRequirements] = useState<ProjectRequirements>(() => {
    const defaultSample = SAMPLE_DATASETS.find((s) => s.id === 'user-login') || SAMPLE_DATASETS[0];
    return JSON.parse(JSON.stringify(defaultSample.data));
  });

  // Current active experiment
  const [currentExperiment, setCurrentExperiment] = useState<ExperimentRecord | null>(null);
  const [modelComparisonExperiment, setModelComparisonExperiment] = useState<ExperimentRecord | null>(null);
  const [experimentsList, setExperimentsList] = useState<ExperimentSummary[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inspectingTestCase, setInspectingTestCase] = useState<TestCase | null>(null);
  const [inspectingPrompt, setInspectingPrompt] = useState<{
    isOpen: boolean;
    strategyId: string;
    promptText: string;
    rawResponse: string;
  }>({
    isOpen: false,
    strategyId: '',
    promptText: '',
    rawResponse: '',
  });

  // Sync theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Initial load: Fetch Ollama status, experiment history, and load demo experiment
  useEffect(() => {
    const initApp = async () => {
      try {
        const status = await ApiService.getOllamaStatus();
        setOllamaStatus(status);
      } catch {
        // Handled gracefully
      }

      try {
        const exps = await ApiService.listExperiments();
        setExperimentsList(exps);
        if (exps.length > 0 && !exps[0].is_corrupted) {
          const firstExp = await ApiService.getExperiment(exps[0].id);
          setCurrentExperiment(firstExp);
        }
      } catch {
        // Fallback
      }
    };

    initApp();
  }, []);

  const handleRefreshHistory = async () => {
    try {
      const exps = await ApiService.listExperiments();
      setExperimentsList(exps);
    } catch (err: any) {
      console.error('Failed to refresh history:', err);
    }
  };

  const handleCheckOllama = async (customUrl?: string) => {
    try {
      const status = await ApiService.getOllamaStatus(customUrl);
      setOllamaStatus(status);
    } catch (err: any) {
      console.error('Ollama check failed:', err);
    }
  };

  const handleLoadExperiment = async (id: string) => {
    try {
      const exp = await ApiService.getExperiment(id);
      if (exp.experiment_type === 'model_comparison') {
        setModelComparisonExperiment(exp);
      } else {
        setCurrentExperiment(exp);
      }
      if (exp.requirements_snapshot) {
        setRequirements(exp.requirements_snapshot);
      }
    } catch (err: any) {
      alert(`Error loading experiment: ${err.message}`);
    }
  };

  const handleLoadBenchmark = () => {
    const benchmark = SAMPLE_DATASETS.find((s) => s.id === 'user-login') || SAMPLE_DATASETS[0];
    setRequirements(JSON.parse(JSON.stringify(benchmark.data)));
    setCurrentTab('requirements');
  };

  // Run generation for single or all strategies
  const handleRunGeneration = async (params: {
    strategy: 'strategy_a' | 'strategy_b' | 'strategy_c' | 'all';
    model_name: string;
    temperature: number;
    seed: number;
  }) => {
    setIsGenerating(true);
    try {
      const results = await ApiService.generateTestCases({
        project_requirements: requirements,
        strategy: params.strategy,
        model_name: params.model_name,
        temperature: params.temperature,
        seed: params.seed,
      });

      const expId = `exp-${Date.now().toString(36)}`;
      const newRecord: ExperimentRecord = {
        id: expId,
        timestamp: new Date().toISOString(),
        project_name: requirements.project_name,
        model_name: params.model_name,
        temperature: params.temperature,
        seed: params.seed,
        prompt_version: 'v1.2.0',
        summary_notes: `Experimental run on ${requirements.project_name} targeting ${params.strategy}.`,
        requirements_snapshot: JSON.parse(JSON.stringify(requirements)),
        strategy_results: results,
        experiment_type: 'prompt_strategy',
      };

      setCurrentExperiment(newRecord);

      // Persist locally
      await ApiService.saveExperiment(newRecord);
      await handleRefreshHistory();
    } catch (err: any) {
      alert(`Generation Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Run model comparison between llama3:latest and codellama:latest
  const handleRunModelComparison = async (params: {
    strategy_id: 'strategy_a' | 'strategy_b' | 'strategy_c';
    models: string[];
    temperature: number;
    seed: number;
  }) => {
    setIsGenerating(true);
    try {
      const results = await ApiService.compareModels({
        project_requirements: requirements,
        strategy_id: params.strategy_id,
        models: params.models,
        temperature: params.temperature,
        seed: params.seed,
      });

      const expId = `exp-models-${Date.now().toString(36)}`;
      const newRecord: ExperimentRecord = {
        id: expId,
        timestamp: new Date().toISOString(),
        project_name: requirements.project_name,
        model_name: params.models.join(' vs '),
        temperature: params.temperature,
        seed: params.seed,
        prompt_version: 'v1.2.0',
        summary_notes: `Model Comparison: ${params.models.join(' vs ')} using ${params.strategy_id}.`,
        requirements_snapshot: JSON.parse(JSON.stringify(requirements)),
        strategy_results: results,
        experiment_type: 'model_comparison',
        compared_models: params.models,
        fixed_strategy: params.strategy_id,
      };

      setModelComparisonExperiment(newRecord);

      // Persist locally
      await ApiService.saveExperiment(newRecord);
      await handleRefreshHistory();
    } catch (err: any) {
      alert(`Model Comparison Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Human in the loop review update
  const handleUpdateHumanReview = async (
    strategyId: string,
    testId: string,
    reviewStatus: ReviewStatus,
    notes?: string,
    flagged?: boolean
  ) => {
    if (!currentExperiment) return;

    // Update locally first for instant feedback
    const updatedExp: ExperimentRecord = JSON.parse(JSON.stringify(currentExperiment));
    const stratRes = updatedExp.strategy_results[strategyId];
    if (stratRes) {
      for (const tc of stratRes.parsed_test_cases) {
        if (tc.test_id === testId) {
          tc.human_review_status = reviewStatus;
          if (notes !== undefined) tc.human_notes = notes;
          if (flagged !== undefined) tc.flagged_unsupported_assumptions = flagged;
          break;
        }
      }

      // Re-evaluate metrics locally
      const reviewed = stratRes.parsed_test_cases.filter(
        (c) => c.human_review_status && c.human_review_status !== 'unreviewed'
      );
      const acceptable = stratRes.parsed_test_cases.filter(
        (c) => c.human_review_status === 'acceptable'
      );
      stratRes.metrics.reviewed_count = reviewed.length;
      stratRes.metrics.acceptable_count = acceptable.length;
      stratRes.metrics.human_acceptance_rate_pct =
        reviewed.length > 0 ? Number(((acceptable.length / reviewed.length) * 100).toFixed(1)) : null;

      setCurrentExperiment(updatedExp);

      // Persist to backend
      try {
        await ApiService.updateHumanReview(currentExperiment.id, strategyId, {
          test_id: testId,
          status: reviewStatus,
          notes,
          flagged_unsupported: flagged,
        });
      } catch (err) {
        console.error('Failed to persist review update:', err);
      }
    }
  };

  // Save edited test case from modal
  const handleSaveEditedTestCase = async (updatedCase: TestCase) => {
    if (!currentExperiment) return;
    const stratId = updatedCase.strategy_id || 'strategy_a';
    const updatedExp: ExperimentRecord = JSON.parse(JSON.stringify(currentExperiment));
    const stratRes = updatedExp.strategy_results[stratId];
    if (stratRes) {
      const idx = stratRes.parsed_test_cases.findIndex((c) => c.test_id === updatedCase.test_id);
      if (idx !== -1) {
        stratRes.parsed_test_cases[idx] = updatedCase;

        // Re-evaluate
        try {
          const recalculated = await ApiService.evaluateSuite({
            test_cases: stratRes.parsed_test_cases,
            requirements: updatedExp.requirements_snapshot,
            generation_time_seconds: stratRes.metrics.generation_time_seconds,
            prompt_tokens: stratRes.metrics.prompt_tokens,
            completion_tokens: stratRes.metrics.completion_tokens,
          });
          stratRes.metrics = recalculated;
        } catch {
          // Keep current
        }

        setCurrentExperiment(updatedExp);
        await ApiService.saveExperiment(updatedExp);
      }
    }
  };

  const handleInspectPromptModal = (strategyId: string, promptText: string, rawResponse: string) => {
    setInspectingPrompt({
      isOpen: true,
      strategyId,
      promptText,
      rawResponse,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50/70 via-white to-emerald-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-violet-200">
      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <TopBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onRunBenchmark={() => {
          setCurrentTab('prompt_lab');
          handleRunGeneration({
            strategy: 'all',
            model_name: ollamaStatus?.selected_model || 'llama3:latest',
            temperature: 0.2,
            seed: 42,
          });
        }}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
      />

      <div className="flex flex-1">
        {/* Workspace Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          ollamaStatus={ollamaStatus}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardOverview
              currentExperiment={currentExperiment}
              currentRequirements={requirements}
              onNavigate={setCurrentTab}
              onRunComparison={() => {
                setCurrentTab('prompt_lab');
                handleRunGeneration({
                  strategy: 'all',
                  model_name: ollamaStatus?.selected_model || 'llama3:latest',
                  temperature: 0.2,
                  seed: 42,
                });
              }}
              onLoadBenchmark={handleLoadBenchmark}
            />
          )}

          {currentTab === 'requirements' && (
            <RequirementsWorkspace
              requirements={requirements}
              onChangeRequirements={setRequirements}
              onProceedToPromptLab={() => setCurrentTab('prompt_lab')}
            />
          )}

          {currentTab === 'prompt_lab' && (
            <PromptLab
              requirements={requirements}
              onRunGeneration={handleRunGeneration}
              isRunning={isGenerating}
              currentResults={currentExperiment?.strategy_results || null}
              ollamaStatus={ollamaStatus}
              onInspectPrompt={handleInspectPromptModal}
              onViewTestCases={() => setCurrentTab('test_cases')}
              onRunModelComparison={handleRunModelComparison}
              modelComparisonResults={modelComparisonExperiment?.strategy_results || null}
            />
          )}

          {currentTab === 'test_cases' && (
            <TestCaseExplorer
              currentExperiment={currentExperiment}
              onUpdateHumanReview={handleUpdateHumanReview}
              onSelectTestCaseForInspection={setInspectingTestCase}
            />
          )}

          {currentTab === 'analytics' && (
            <EvaluationAnalytics currentExperiment={currentExperiment} />
          )}

          {currentTab === 'experiments' && (
            <ExperimentHistory
              experiments={experimentsList}
              onLoadExperiment={handleLoadExperiment}
              onRefreshHistory={handleRefreshHistory}
              currentExperimentId={currentExperiment?.id}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        ollamaStatus={ollamaStatus}
        onCheckStatus={handleCheckOllama}
        onSelectModel={(model) => {
          if (ollamaStatus) {
            setOllamaStatus({ ...ollamaStatus, selected_model: model });
          }
        }}
      />

      <TestCaseModal
        testCase={inspectingTestCase}
        onClose={() => setInspectingTestCase(null)}
        onSaveTestCase={handleSaveEditedTestCase}
      />

      <PromptInspectorModal
        isOpen={inspectingPrompt.isOpen}
        onClose={() =>
          setInspectingPrompt((prev) => ({ ...prev, isOpen: false }))
        }
        strategyId={inspectingPrompt.strategyId}
        promptText={inspectingPrompt.promptText}
        rawResponse={inspectingPrompt.rawResponse}
      />
    </div>
  );
}
