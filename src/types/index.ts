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
