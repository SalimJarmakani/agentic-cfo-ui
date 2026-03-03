export interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface SpendingSummary {
  userId: string;
  totalSpend: number;
  period: string;
  categories: SpendingCategory[];
  recurringPayments: number;
  subscriptions: number;
}

export interface OptimizationSuggestion {
  id: string;
  title: string;
  description: string;
  estimatedSavings: number;
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
  userId: string;
  overallStatus: 'compliant' | 'warning' | 'violation';
  score: number;
  rules: PolicyRule[];
}

export interface AgentPipelineStatus {
  analysisAgent: 'idle' | 'running' | 'done' | 'error';
  planningAgent: 'idle' | 'running' | 'done' | 'error';
  policyAgent: 'idle' | 'running' | 'done' | 'error';
  explanationAgent: 'idle' | 'running' | 'done' | 'error';
}
