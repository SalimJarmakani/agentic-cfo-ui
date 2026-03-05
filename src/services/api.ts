import type {
  SpendingSummary,
  OptimizationSuggestion,
  PolicyCompliance,
  AgentPipelineStatus,
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

export async function fetchSpendingSummary(userId: string): Promise<SpendingSummary> {
  const res = await fetch(`${BASE_URL}/summary/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch spending summary');
  return res.json();
}

// -- Optimization Suggestions --

export async function fetchOptimizationSuggestions(userId: string): Promise<OptimizationSuggestion[]> {
  const res = await fetch(`${BASE_URL}/optimization/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch optimization suggestions');
  return res.json();
}

// -- Policy Compliance --

export async function fetchPolicyCompliance(userId: string): Promise<PolicyCompliance> {
  const res = await fetch(`${BASE_URL}/policy/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch policy compliance');
  return res.json();
}

// -- Agent Pipeline Status --

export async function fetchAgentStatus(): Promise<AgentPipelineStatus> {
  const res = await fetch(`${BASE_URL}/agents/status`);
  if (!res.ok) throw new Error('Failed to fetch agent status');
  return res.json();
}
