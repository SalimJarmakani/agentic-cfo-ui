import type { AgentWorkflowSummary, WorkflowStage, WorkflowStatus, WorkflowStep, WorkflowStepStatus } from '../../types';

export const DEFAULT_WORKFLOW_QUESTION = 'Provide a financial assessment and a simple action plan.';

export const workflowStatusLabel: Record<WorkflowStatus, string> = {
  running: 'Running',
  waiting_for_user: 'Ready to continue',
  completed: 'Completed',
  failed: 'Failed',
};

export const workflowStageLabel: Record<WorkflowStage, string> = {
  analysis: 'Analysis',
  planning: 'Planning',
  policy: 'Policy',
  done: 'Done',
  failed: 'Failed',
};

export const workflowStepTitle: Record<WorkflowStep['step_name'], string> = {
  analysis: 'Analysis Agent',
  planning: 'Planning Agent',
  policy: 'Policy Agent',
};

export const workflowStepStatusLabel: Record<WorkflowStepStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
};

export function formatWorkflowDate(value?: string | null): string {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function canContinueWorkflow(workflow: Pick<AgentWorkflowSummary, 'status'>): boolean {
  return workflow.status === 'waiting_for_user';
}

export function getPreferredWorkflowId(workflows: AgentWorkflowSummary[]): number | null {
  return workflows.find(canContinueWorkflow)?.workflow_run_id ?? workflows[0]?.workflow_run_id ?? null;
}

export function formatCurrency(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--';
  return `$${value.toLocaleString()}`;
}
