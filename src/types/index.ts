export interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
  transaction_count: number;
}

export interface SpendingSummary {
  user_id: number;
  total_spend: number;
  period: string;
  categories: SpendingCategory[];
  recurring_payments: number;
  subscriptions: number;
}

export interface UserSpendingOverview {
  user_id: number;
  txn_count: number;
  total_spend: number;
  avg_ticket: number;
  first_txn_ts: string | null;
  last_txn_ts: string | null;
}

export interface UsersSpendingOverviewResponse {
  items: UserSpendingOverview[];
}

export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  estimated_savings: number;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PolicyRule {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'warning' | 'violation';
  detail: string;
}

export interface PolicyCompliance {
  user_id: number;
  overall_status: 'compliant' | 'warning' | 'violation';
  score: number;
  rules: PolicyRule[];
}

export interface AgentPipelineStatus {
  analysisAgent: 'idle' | 'running' | 'done' | 'error';
  planningAgent: 'idle' | 'running' | 'done' | 'error';
  policyAgent: 'idle' | 'running' | 'done' | 'error';
  explanationAgent: 'idle' | 'running' | 'done' | 'error';
}

export interface UserSpendingSummary {
  user_id: number;
  txn_count: number;
  total_spend: number;
  avg_ticket: number;
  first_txn_ts: string | null;
  last_txn_ts: string | null;
}

export interface RecentTransaction {
  txn_id: number;
  user_id: number;
  card_id: number;
  merchant_id: number;
  txn_ts: string;
  amount: string | number; // Postgres Decimal serializes as string in Dict[str, Any]
  mcc: number;
}

export interface UserAnalysis {
  user_id: number;
  input_tokens: number;
  analysis: string;
  supporting_data: {
    user_spending_summary: UserSpendingSummary;
    user_spending_graph: SpendingSummary;
    optimization: {
      user_id: number;
      suggestions: OptimizationSuggestion[];
      total_estimated_savings: number;
    };
    policy: PolicyCompliance;
    recent_transactions: RecentTransaction[];
  };
}

export type WorkflowStepName = 'analysis' | 'planning' | 'policy' | 'explanation';
export type WorkflowStepStatus = 'pending' | 'running' | 'completed' | 'failed';
export type WorkflowStatus = 'running' | 'waiting_for_user' | 'completed' | 'failed';
export type WorkflowStage = 'analysis' | 'planning' | 'policy' | 'explanation' | 'done' | 'failed';
export interface WorkflowStep {
  workflow_step_id: number;
  workflow_run_id: number;
  step_name: WorkflowStepName;
  status: WorkflowStepStatus;
  input_payload?: Record<string, unknown> | null;
  output_payload?: Record<string, unknown> | null;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AgentWorkflowSummary {
  workflow_run_id: number;
  user_id: number;
  question: string;
  status: WorkflowStatus;
  current_stage: WorkflowStage;
  created_at: string;
  updated_at: string;
}

export interface AgentWorkflow {
  workflow_run_id: number;
  user_id: number;
  question: string;
  status: WorkflowStatus;
  current_stage: WorkflowStage;
  created_at: string;
  updated_at: string;
  steps: WorkflowStep[];
}

export interface AgentWorkflowListResponse {
  user_id: number;
  items: AgentWorkflowSummary[];
}

export interface MetricsSummary {
  analytics_accuracy_rate: number | null;
  analytics_accuracy_total_evaluations: number;
  workflow_completion_rate: number | null;
  workflow_total_runs: number;
  workflow_completed_runs: number;
  workflow_failed_runs: number;
  workflow_in_progress_runs: number;
  policy_intervention_rate: number | null;
  policy_intervention_total_reviews: number;
  policy_intervention_count: number;
  policy_compliance_rate: number | null;
  policy_compliance_total_reviews: number;
  policy_compliant_count: number;
  average_api_response_time_ms: number | null;
  average_workflow_completion_time_ms: number | null;
  average_stage_response_time_ms: Record<string, number>;
  human_recommendation_usefulness_avg: number | null;
  human_recommendation_usefulness_total_reviews: number;
}

export interface AgentTokenUsage {
  average_input_tokens_by_agent: Record<string, number | null>;
  runs_with_input_tokens_by_agent: Record<string, number>;
}

export interface ValidatedQueryEvaluationRequest {
  question: string;
  expected_answer: string;
  actual_answer?: string;
  top_k?: number;
  is_correct?: boolean | null;
  evaluator?: string;
  notes?: string;
}

export interface ValidatedQueryEvaluationResponse {
  evaluation_id: number;
  question: string;
  expected_answer: string;
  actual_answer: string;
  is_correct: boolean | null;
  evaluator?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface RecommendationFeedbackRequest {
  workflow_run_id: number;
  recommendation_stage: 'analysis' | 'planning' | 'policy' | 'explanation';
  usefulness_rating: number;
  clarity_rating?: number | null;
  adopted?: boolean | null;
  evaluator?: string;
  comments?: string;
}

export interface RecommendationFeedbackResponse {
  feedback_id: number;
  workflow_run_id: number;
  recommendation_stage: 'analysis' | 'planning' | 'policy' | 'explanation';
  usefulness_rating: number;
  clarity_rating?: number | null;
  adopted?: boolean | null;
  evaluator?: string | null;
  comments?: string | null;
  created_at: string;
}
