/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryType = 'positive' | 'negative' | 'boundary' | 'validation' | 'security';
export type PriorityType = 'high' | 'medium' | 'low';
export type ReviewStatus = 'unreviewed' | 'acceptable' | 'needs_improvement' | 'incorrect';

export interface RequirementItem {
  id: string;
  title: string;
  description: string;
  acceptance_criteria: string[];
  is_unresolved: boolean;
  unresolved_note?: string | null;
}

export interface ProjectRequirements {
  project_name: string;
  requirements: RequirementItem[];
  system_assumptions: string[];
}

export interface TestCase {
  test_id: string;
  requirement_ids: string[];
  title: string;
  category: string;
  priority: string;
  preconditions: string[];
  steps: string[];
  test_data?: string;
  expected_result: string;
  assumptions: string[];
  
  // Human review
  human_review_status?: ReviewStatus;
  human_notes?: string | null;
  flagged_unsupported_assumptions?: boolean;
  
  // Metadata
  strategy_id?: 'strategy_a' | 'strategy_b' | 'strategy_c' | string;
  created_at?: string;
}

export interface EvaluationMetrics {
  total_test_cases: number;
  total_requirements: number;
  covered_requirements: number;
  requirement_coverage_pct: number;
  valid_test_cases: number;
  schema_validity_pct: number;
  complete_test_cases: number;
  completeness_pct: number;
  duplicate_count: number;
  duplicate_rate_pct: number;
  categories_represented: string[];
  missing_categories: string[];
  category_counts: Record<string, number>;
  generation_time_seconds: number;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
  load_duration_ms?: number | null;
  eval_duration_ms?: number | null;
  tokens_per_second?: number | null;
  reviewed_count: number;
  acceptable_count: number;
  needs_improvement_count: number;
  incorrect_count: number;
  human_acceptance_rate_pct: number | null;
}

export interface StrategyRunResult {
  strategy_id: string;
  strategy_name: string;
  prompt_used: string;
  raw_response: string;
  parsed_test_cases: TestCase[];
  metrics: EvaluationMetrics;
  validation_errors: string[];
  repair_attempted: boolean;
  repaired_output?: string | null;
  status: 'success' | 'partial' | 'failed';
  error_message?: string | null;
  model_name?: string;
}

export interface ExperimentRecord {
  id: string;
  timestamp: string;
  project_name: string;
  model_name: string;
  temperature: number;
  seed?: number | null;
  prompt_version: string;
  summary_notes?: string | null;
  requirements_snapshot: ProjectRequirements;
  strategy_results: Record<string, StrategyRunResult>;
  experiment_type?: 'prompt_strategy' | 'model_comparison';
  compared_models?: string[];
  fixed_strategy?: string;
}

export interface ExperimentSummary {
  id: string;
  filename: string;
  timestamp: string;
  project_name: string;
  model_name: string;
  strategies: string[];
  total_test_cases: number;
  is_corrupted: boolean;
  error?: string;
  experiment_type?: 'prompt_strategy' | 'model_comparison';
}

export interface OllamaStatus {
  reachable: boolean;
  endpoint: string;
  selected_model: string;
  available_models: string[];
  message: string;
  installation_instructions?: Record<string, string>;
}

export type ViewTab =
  | 'dashboard'
  | 'requirements'
  | 'prompt_lab'
  | 'test_cases'
  | 'analytics'
  | 'experiments'
  | 'settings';

