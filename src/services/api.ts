/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ProjectRequirements,
  StrategyRunResult,
  EvaluationMetrics,
  ExperimentRecord,
  ExperimentSummary,
  OllamaStatus,
  TestCase,
  ReviewStatus,
} from '../types';

export class ApiService {
  private static baseUrl = '';

  static async getHealth(): Promise<{ status: string; service: string; version: string }> {
    const res = await fetch(`${this.baseUrl}/api/health`);
    if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
    return res.json();
  }

  static async getOllamaStatus(customUrl?: string): Promise<OllamaStatus> {
    const url = customUrl ? `/api/ollama/status?url=${encodeURIComponent(customUrl)}` : '/api/ollama/status';
    const res = await fetch(`${this.baseUrl}${url}`);
    if (!res.ok) throw new Error(`Failed to check Ollama status: ${res.statusText}`);
    return res.json();
  }

  static async generateTestCases(payload: {
    project_requirements: ProjectRequirements;
    strategy: 'strategy_a' | 'strategy_b' | 'strategy_c' | 'all';
    model_name: string;
    temperature: number;
    seed?: number | null;
  }): Promise<Record<string, StrategyRunResult>> {
    const res = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || err.detail || 'Generation failed');
    }
    return res.json();
  }

  static async compareModels(payload: {
    project_requirements: ProjectRequirements;
    models: string[];
    strategy?: 'strategy_a' | 'strategy_b' | 'strategy_c';
    strategy_id?: 'strategy_a' | 'strategy_b' | 'strategy_c';
    temperature: number;
    seed?: number | null;
  }): Promise<Record<string, StrategyRunResult>> {
    const strat = payload.strategy_id || payload.strategy || 'strategy_b';
    const bodyPayload = {
      ...payload,
      strategy_id: strat,
      strategy: strat,
    };
    const res = await fetch(`${this.baseUrl}/api/compare-models`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyPayload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || err.detail || 'Model comparison failed');
    }
    return res.json();
  }

  static async evaluateSuite(payload: {
    test_cases: TestCase[];
    requirements: ProjectRequirements;
    generation_time_seconds?: number;
    prompt_tokens?: number | null;
    completion_tokens?: number | null;
  }): Promise<EvaluationMetrics> {
    const res = await fetch(`${this.baseUrl}/api/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Evaluation call failed');
    return res.json();
  }

  static async listExperiments(): Promise<ExperimentSummary[]> {
    const res = await fetch(`${this.baseUrl}/api/experiments`);
    if (!res.ok) throw new Error('Failed to load experiment history');
    return res.json();
  }

  static async getExperiment(id: string): Promise<ExperimentRecord> {
    const res = await fetch(`${this.baseUrl}/api/experiments/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`Experiment ${id} not found`);
    return res.json();
  }

  static async saveExperiment(experiment: ExperimentRecord): Promise<{ status: string; id: string }> {
    const res = await fetch(`${this.baseUrl}/api/experiments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(experiment),
    });
    if (!res.ok) throw new Error('Failed to save experiment');
    return res.json();
  }

  static async updateHumanReview(
    experimentId: string,
    strategyId: string,
    payload: {
      test_id: string;
      status: ReviewStatus;
      notes?: string | null;
      flagged_unsupported?: boolean;
    }
  ): Promise<{ status: string; test_id: string }> {
    const res = await fetch(
      `${this.baseUrl}/api/experiments/${encodeURIComponent(experimentId)}/strategies/${encodeURIComponent(strategyId)}/review`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
    if (!res.ok) throw new Error('Failed to update human review status');
    return res.json();
  }

  static downloadCsv(cases: TestCase[], filename = 'test_cases.csv') {
    const headers = [
      'test_id',
      'strategy_id',
      'requirement_ids',
      'title',
      'category',
      'priority',
      'preconditions',
      'steps',
      'test_data',
      'expected_result',
      'assumptions',
      'human_review_status',
      'flagged_unsupported_assumptions',
      'human_notes',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const lines = [headers.join(',')];
    for (const tc of cases) {
      lines.push(
        [
          escapeCsv(tc.test_id),
          escapeCsv(tc.strategy_id || ''),
          escapeCsv((tc.requirement_ids || []).join(', ')),
          escapeCsv(tc.title),
          escapeCsv(tc.category),
          escapeCsv(tc.priority),
          escapeCsv((tc.preconditions || []).join(' | ')),
          escapeCsv((tc.steps || []).join(' -> ')),
          escapeCsv(tc.test_data || ''),
          escapeCsv(tc.expected_result),
          escapeCsv((tc.assumptions || []).join(' | ')),
          escapeCsv(tc.human_review_status || 'unreviewed'),
          escapeCsv(tc.flagged_unsupported_assumptions ? 'TRUE' : 'FALSE'),
          escapeCsv(tc.human_notes || ''),
        ].join(',')
      );
    }

    const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  static downloadJson(data: any, filename = 'test_cases.json') {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
