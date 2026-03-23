import type {
  SpendingSummary,
  UsersSpendingOverviewResponse,
  OptimizationSuggestion,
  PolicyCompliance,
  AgentPipelineStatus,
  UserAnalysis,
  AgentWorkflow,
  AgentWorkflowListResponse,
  AgentTokenUsage,
  MetricsSummary,
  ValidatedQueryEvaluationRequest,
  ValidatedQueryEvaluationResponse,
  RecommendationFeedbackRequest,
  RecommendationFeedbackResponse,
} from '../types';

const BASE_URL = (import.meta.env.VITE_API_URL as string) ?? '';

// -- Users --

export interface User {
  user_id: number;
  current_age: number;
  gender: string;
  address: string;
  yearly_income: number;
  total_debt: number;
  credit_score: number;
  num_credit_cards: number;
}

export interface PaginatedUsersResponse {
  page: number;
  page_size: number;
  total: number;
  items: User[];
}

export async function fetchUsers(page = 1, pageSize = 25): Promise<PaginatedUsersResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/analytics/users?page=${page}&page_size=${pageSize}`);
  if (!res.ok) throw new Error(`Failed to fetch users (${res.status})`);
  return res.json();
}

// -- Spending Summary --
// previous: fetch(`${BASE_URL}/summary/${userId}`)
export async function fetchSpendingSummary(userId: number): Promise<SpendingSummary> {
  const res = await fetch(`${BASE_URL}/api/v1/graph/users/${userId}/spending`);
  if (!res.ok) throw new Error('Failed to fetch spending summary');
  return res.json();
}

export async function fetchUserSpendingSummary(userId: number): Promise<{
  user_id: number;
  txn_count: number;
  total_spend: number;
  avg_ticket: number;
  first_txn_ts: string | null;
  last_txn_ts: string | null;
}> {
  const res = await fetch(`${BASE_URL}/api/v1/analytics/users/${userId}/spending`);
  if (!res.ok) throw new Error('Failed to fetch user spending summary');
  return res.json();
}

export async function fetchUsersSpendingOverview(): Promise<UsersSpendingOverviewResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/analytics/users/spending-overview`);
  if (!res.ok) throw new Error('Failed to fetch users spending overview');
  return res.json();
}

// -- Optimization Suggestions --
// previous: fetch(`${BASE_URL}/optimization/${userId}`) — returned OptimizationSuggestion[] directly
export async function fetchOptimizationSuggestions(userId: number): Promise<OptimizationSuggestion[]> {
  const res = await fetch(`${BASE_URL}/api/v1/graph/users/${userId}/optimization`);
  if (!res.ok) throw new Error('Failed to fetch optimization suggestions');
  const data = await res.json();
  return data.suggestions;
}

// -- Policy Compliance --
// previous: fetch(`${BASE_URL}/policy/${userId}`)
export async function fetchPolicyCompliance(userId: number): Promise<PolicyCompliance> {
  const res = await fetch(`${BASE_URL}/api/v1/graph/users/${userId}/policy`);
  if (!res.ok) throw new Error('Failed to fetch policy compliance');
  return res.json();
}

// -- User Analysis --

export async function fetchUserAnalysis(userId: number): Promise<UserAnalysis> {
  const res = await fetch(`${BASE_URL}/api/v1/agent/analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error('Failed to fetch user analysis');
  return res.json();
}

// -- Agent Workflows --

export async function fetchUserWorkflows(userId: number, limit = 20): Promise<AgentWorkflowListResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/agent/workflows?user_id=${userId}&limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch workflows (${res.status})`);
  return res.json();
}

export async function fetchAgentWorkflow(workflowRunId: number): Promise<AgentWorkflow> {
  const res = await fetch(`${BASE_URL}/api/v1/agent/workflows/${workflowRunId}`);
  if (!res.ok) throw new Error(`Failed to fetch workflow (${res.status})`);
  return res.json();
}

export async function startAgentWorkflow(userId: number, question: string): Promise<AgentWorkflow> {
  const res = await fetch(`${BASE_URL}/api/v1/agent/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, question }),
  });
  if (!res.ok) throw new Error(`Failed to start workflow (${res.status})`);
  return res.json();
}

export async function continueAgentWorkflow(workflowRunId: number): Promise<AgentWorkflow> {
  const res = await fetch(`${BASE_URL}/api/v1/agent/workflows/${workflowRunId}/continue`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to continue workflow (${res.status})`);
  return res.json();
}

// -- Metrics --

export async function fetchMetricsSummary(): Promise<MetricsSummary> {
  const res = await fetch(`${BASE_URL}/api/v1/metrics/summary`);
  if (!res.ok) throw new Error(`Failed to fetch metrics summary (${res.status})`);
  return res.json();
}

export async function fetchAgentTokenUsage(): Promise<AgentTokenUsage> {
  const res = await fetch(`${BASE_URL}/api/v1/metrics/agent-token-usage`);
  if (!res.ok) throw new Error(`Failed to fetch agent token usage (${res.status})`);
  return res.json();
}

export async function createValidatedQueryEvaluation(
  payload: ValidatedQueryEvaluationRequest,
): Promise<ValidatedQueryEvaluationResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/metrics/validated-queries/evaluations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save validated query evaluation (${res.status})`);
  return res.json();
}

export async function createRecommendationFeedback(
  payload: RecommendationFeedbackRequest,
): Promise<RecommendationFeedbackResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/metrics/recommendation-feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to save recommendation feedback (${res.status})`);
  return res.json();
}

// -- Agent Pipeline Status --

export async function fetchAgentStatus(): Promise<AgentPipelineStatus> {
  const res = await fetch(`${BASE_URL}/agents/status`);
  if (!res.ok) throw new Error('Failed to fetch agent status');
  return res.json();
}
