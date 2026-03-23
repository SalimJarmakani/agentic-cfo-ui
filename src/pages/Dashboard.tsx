import { useEffect, useState, type CSSProperties } from 'react';
import WorkflowDetailCard from '../components/dashboard/WorkflowDetailCard';
import WorkflowOutputs from '../components/dashboard/WorkflowOutputs';
import WorkflowPipeline from '../components/dashboard/WorkflowPipeline';
import WorkflowSidebar from '../components/dashboard/WorkflowSidebar';
import WorkflowUserPolicies from '../components/dashboard/WorkflowUserPolicies';
import '../components/dashboard/DashboardWorkflow.css';
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar';
import './Page.css';
import {
  continueAgentWorkflow,
  fetchAgentWorkflow,
  fetchUserWorkflows,
  fetchUsers,
  startAgentWorkflow,
  type PaginatedUsersResponse,
} from '../services/api';
import type { AgentWorkflow, AgentWorkflowSummary } from '../types';
import {
  DEFAULT_WORKFLOW_QUESTION,
  getPreferredWorkflowId,
} from '../components/dashboard/workflowFormat';
import type { WorkflowStage, WorkflowStep, WorkflowStepName, WorkflowStatus } from '../types';

const USER_PAGE_SIZE = 10;
const WORKFLOW_LIMIT = 25;
const WORKFLOW_STEP_ORDER: Record<WorkflowStepName, number> = {
  analysis: 0,
  planning: 1,
  policy: 2,
  explanation: 3,
};
const WORKFLOW_STEP_SEQUENCE: WorkflowStepName[] = ['analysis', 'planning', 'policy', 'explanation'];

const workflowSidebarStyle = {
  '--sidebar-width': '21rem',
  '--sidebar-width-icon': '4.5rem',
} as CSSProperties;

function isWorkflowStatus(value: string): value is WorkflowStatus {
  return value === 'running' || value === 'waiting_for_user' || value === 'completed' || value === 'failed';
}

function isWorkflowStage(value: string): value is WorkflowStage {
  return (
    value === 'analysis' ||
    value === 'planning' ||
    value === 'policy' ||
    value === 'explanation' ||
    value === 'done' ||
    value === 'failed'
  );
}

function isWorkflowStepName(value: string): value is WorkflowStepName {
  return value === 'analysis' || value === 'planning' || value === 'policy' || value === 'explanation';
}

function normalizeWorkflowStep(step: WorkflowStep): WorkflowStep {
  const stepName = isWorkflowStepName(step.step_name) ? step.step_name : 'analysis';
  return {
    ...step,
    step_name: stepName,
  };
}

function normalizeWorkflowSummary(workflow: AgentWorkflowSummary): AgentWorkflowSummary {
  return {
    ...workflow,
    status: isWorkflowStatus(workflow.status) ? workflow.status : 'failed',
    current_stage: isWorkflowStage(workflow.current_stage) ? workflow.current_stage : 'failed',
  };
}

function normalizeWorkflow(workflow: AgentWorkflow): AgentWorkflow {
  return {
    ...normalizeWorkflowSummary(workflow),
    steps: [...workflow.steps]
      .map(normalizeWorkflowStep)
      .sort((left, right) => WORKFLOW_STEP_ORDER[left.step_name] - WORKFLOW_STEP_ORDER[right.step_name]),
  };
}

function getNextWorkflowStep(currentStage: WorkflowStage): WorkflowStepName | null {
  if (currentStage === 'analysis') return 'planning';
  if (currentStage === 'planning') return 'policy';
  if (currentStage === 'policy') return 'explanation';
  return null;
}

function getResumeStepFromWorkflow(workflow: Pick<AgentWorkflow, 'status' | 'current_stage' | 'steps'>): WorkflowStepName | null {
  if (workflow.status === 'waiting_for_user') {
    return getNextWorkflowStep(workflow.current_stage);
  }

  if (workflow.status !== 'failed') {
    return null;
  }

  const hasCompletedStep = workflow.steps.some((step) => step.status === 'completed');
  const firstIncompleteStep = WORKFLOW_STEP_SEQUENCE.find((stepName) => {
    const step = workflow.steps.find((candidate) => candidate.step_name === stepName);
    return step?.status !== 'completed';
  });

  if (!firstIncompleteStep) {
    return null;
  }

  if (!hasCompletedStep && firstIncompleteStep === 'analysis') {
    return null;
  }

  return firstIncompleteStep;
}

function buildOptimisticSteps(
  runningStep: WorkflowStepName,
  workflowRunId: number,
  existingSteps: WorkflowStep[] = [],
): WorkflowStep[] {
  const now = new Date().toISOString();
  const existingByName = new Map(existingSteps.map((step) => [step.step_name, step]));
  const runningStepOrder = WORKFLOW_STEP_ORDER[runningStep];

  return WORKFLOW_STEP_SEQUENCE.map((stepName, index) => {
    const existing = existingByName.get(stepName);
    const nextStatus =
      index < runningStepOrder ? 'completed' : stepName === runningStep ? 'running' : 'pending';

    return {
      workflow_step_id: existing?.workflow_step_id ?? -(workflowRunId * 10 + index + 1),
      workflow_run_id: existing?.workflow_run_id ?? workflowRunId,
      step_name: stepName,
      status: nextStatus,
      input_payload: existing?.input_payload ?? null,
      output_payload: nextStatus === 'completed' ? (existing?.output_payload ?? null) : null,
      error_message: null,
      started_at: nextStatus === 'running' ? now : existing?.started_at ?? null,
      completed_at: nextStatus === 'completed' ? (existing?.completed_at ?? now) : null,
      created_at: existing?.created_at ?? now,
      updated_at: now,
    };
  });
}

function buildOptimisticWorkflowSummary(
  workflow: AgentWorkflowSummary,
  runningStep: WorkflowStepName,
): AgentWorkflowSummary {
  return normalizeWorkflowSummary({
    ...workflow,
    status: 'running',
    current_stage: runningStep,
    updated_at: new Date().toISOString(),
  });
}

function buildOptimisticWorkflow(
  workflow: AgentWorkflow,
  runningStep: WorkflowStepName,
): AgentWorkflow {
  return normalizeWorkflow({
    ...workflow,
    status: 'running',
    current_stage: runningStep,
    updated_at: new Date().toISOString(),
    steps: buildOptimisticSteps(runningStep, workflow.workflow_run_id, workflow.steps),
  });
}

function createOptimisticStartedWorkflow(userId: number, question: string): AgentWorkflow {
  const now = new Date().toISOString();
  const tempWorkflowRunId = -Date.now();

  return normalizeWorkflow({
    workflow_run_id: tempWorkflowRunId,
    user_id: userId,
    question,
    status: 'running',
    current_stage: 'analysis',
    created_at: now,
    updated_at: now,
    steps: buildOptimisticSteps('analysis', tempWorkflowRunId),
  });
}

export default function Dashboard() {
  const [usersPage, setUsersPage] = useState(1);
  const [usersData, setUsersData] = useState<PaginatedUsersResponse | null>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [workflowQuestion, setWorkflowQuestion] = useState(DEFAULT_WORKFLOW_QUESTION);

  const [workflows, setWorkflows] = useState<AgentWorkflowSummary[]>([]);
  const [workflowsLoading, setWorkflowsLoading] = useState(false);
  const [workflowsError, setWorkflowsError] = useState<string | null>(null);

  const [selectedWorkflowId, setSelectedWorkflowId] = useState<number | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<AgentWorkflow | null>(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);
  const [workflowError, setWorkflowError] = useState<string | null>(null);

  const [startingWorkflow, setStartingWorkflow] = useState(false);
  const [continuingWorkflowId, setContinuingWorkflowId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  useEffect(() => {
    if (!isPolicyModalOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsPolicyModalOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPolicyModalOpen]);

  useEffect(() => {
    let cancelled = false;

    setUsersLoading(true);
    setUsersError(null);

    fetchUsers(usersPage, USER_PAGE_SIZE)
      .then((response) => {
        if (cancelled) return;
        setUsersData(response);
        setSelectedUserId((current) => current ?? response.items[0]?.user_id ?? null);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setUsersError(error.message);
      })
      .finally(() => {
        if (!cancelled) setUsersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [usersPage]);

  useEffect(() => {
    if (!selectedUserId) {
      setWorkflows([]);
      setSelectedWorkflowId(null);
      setSelectedWorkflow(null);
      return;
    }

    let cancelled = false;

    setWorkflowsLoading(true);
    setWorkflowsError(null);
    setWorkflowError(null);

    fetchUserWorkflows(selectedUserId, WORKFLOW_LIMIT)
      .then((response) => {
        if (cancelled) return;

        const nextWorkflows = response.items.map(normalizeWorkflowSummary);
        setWorkflows(nextWorkflows);
        setSelectedWorkflowId((current) => {
          if (current && nextWorkflows.some((item) => item.workflow_run_id === current)) {
            return current;
          }
          return getPreferredWorkflowId(nextWorkflows);
        });
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setWorkflows([]);
        setSelectedWorkflowId(null);
        setSelectedWorkflow(null);
        setWorkflowsError(error.message);
      })
      .finally(() => {
        if (!cancelled) setWorkflowsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedUserId]);

  useEffect(() => {
    if (!selectedWorkflowId) {
      setSelectedWorkflow(null);
      setWorkflowError(null);
      return;
    }

    let cancelled = false;
    const hasLocalWorkflow = selectedWorkflow?.workflow_run_id === selectedWorkflowId;

    if (!hasLocalWorkflow) {
      setWorkflowLoading(true);
    }
    setWorkflowError(null);

    fetchAgentWorkflow(selectedWorkflowId)
      .then((response) => {
        if (!cancelled) setSelectedWorkflow(normalizeWorkflow(response));
      })
      .catch((error: Error) => {
        if (!cancelled) {
          if (!hasLocalWorkflow) {
            setSelectedWorkflow(null);
          }
          setWorkflowError(error.message);
        }
      })
      .finally(() => {
        if (!cancelled) setWorkflowLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedWorkflowId]);

  const totalUserPages = usersData ? Math.ceil(usersData.total / USER_PAGE_SIZE) : 1;
  const workflowCountLabel = workflowsLoading
    ? 'Loading runs'
    : `${workflows.length} run${workflows.length === 1 ? '' : 's'}`;

  async function refreshWorkflowList(userId: number, nextSelectedWorkflowId: number | null) {
    const response = await fetchUserWorkflows(userId, WORKFLOW_LIMIT);
    const nextWorkflows = response.items.map(normalizeWorkflowSummary);
    setWorkflows(nextWorkflows);

    const resolvedWorkflowId =
      nextSelectedWorkflowId && nextWorkflows.some((item) => item.workflow_run_id === nextSelectedWorkflowId)
        ? nextSelectedWorkflowId
        : getPreferredWorkflowId(nextWorkflows);

    setSelectedWorkflowId(resolvedWorkflowId);
  }

  async function handleStartWorkflow() {
    if (!selectedUserId) return;

    const nextQuestion = workflowQuestion.trim() || workflowQuestion;
    const optimisticWorkflow = createOptimisticStartedWorkflow(selectedUserId, nextQuestion);

    setStartingWorkflow(true);
    setActionError(null);
    setWorkflowError(null);
    setSelectedWorkflow(optimisticWorkflow);
    setWorkflowLoading(false);

    try {
      const workflow = normalizeWorkflow(await startAgentWorkflow(selectedUserId, nextQuestion));
      setSelectedWorkflow(workflow);
      setSelectedWorkflowId(workflow.workflow_run_id);
      await refreshWorkflowList(selectedUserId, workflow.workflow_run_id);
    } catch (error) {
      setSelectedWorkflow(null);
      setActionError(error instanceof Error ? error.message : 'Failed to start workflow.');
    } finally {
      setStartingWorkflow(false);
    }
  }

  async function handleContinueWorkflow(workflowRunId: number) {
    if (!selectedUserId) return;

    const workflowSummary = workflows.find((item) => item.workflow_run_id === workflowRunId) ?? null;

    setContinuingWorkflowId(workflowRunId);
    setActionError(null);
    setWorkflowError(null);

    try {
      const selectedWorkflowMatches = selectedWorkflow?.workflow_run_id === workflowRunId ? selectedWorkflow : null;
      const workflowForResume =
        selectedWorkflowMatches ??
        (workflowSummary?.status === 'failed' ? normalizeWorkflow(await fetchAgentWorkflow(workflowRunId)) : null);
      const optimisticStep =
        (workflowForResume && getResumeStepFromWorkflow(workflowForResume)) ||
        (workflowSummary?.status === 'waiting_for_user' ? getNextWorkflowStep(workflowSummary.current_stage) : null);

      if (!optimisticStep) {
        setActionError('This workflow cannot be resumed because no successful stage is available to continue from.');
        return;
      }

      setWorkflows((current) =>
        current.map((workflow) =>
          workflow.workflow_run_id === workflowRunId
            ? buildOptimisticWorkflowSummary(workflow, optimisticStep)
            : workflow,
        ),
      );
      setSelectedWorkflowId(workflowRunId);
      setWorkflowLoading(false);
      setSelectedWorkflow((current) => {
        if (workflowForResume) {
          return buildOptimisticWorkflow(workflowForResume, optimisticStep);
        }

        if (!workflowSummary) {
          return current;
        }

        return normalizeWorkflow({
          workflow_run_id: workflowSummary.workflow_run_id,
          user_id: workflowSummary.user_id,
          question: workflowSummary.question,
          status: 'running',
          current_stage: optimisticStep,
          created_at: workflowSummary.created_at,
          updated_at: new Date().toISOString(),
          steps: buildOptimisticSteps(optimisticStep, workflowSummary.workflow_run_id),
        });
      });

      const workflow = normalizeWorkflow(await continueAgentWorkflow(workflowRunId));
      setSelectedWorkflow(workflow);
      setSelectedWorkflowId(workflow.workflow_run_id);
      await refreshWorkflowList(selectedUserId, workflow.workflow_run_id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to continue workflow.');
    } finally {
      setContinuingWorkflowId(null);
    }
  }

  function handleSelectUser(userId: number) {
    setSelectedUserId(userId);
    setSelectedWorkflowId(null);
    setSelectedWorkflow(null);
    setActionError(null);
  }

  return (
    <div className="page dashboard-page">
      <header className="workflow-page-header">
        <div className="workflow-page-copy">
          <span className="workflow-page-eyebrow">Agent CFO Workspace</span>
          <h1 className="workflow-page-title">Workflow Dashboard</h1>
          <p className="workflow-page-subtitle">
            Review users, run the staged agent workflow, and inspect analysis, planning, policy, and explanation outputs in one place.
          </p>
        </div>
        <div className="workflow-page-meta">
          <span className="workflow-page-pill">
            User {selectedUserId ?? '--'}
          </span>
          <span className="workflow-page-pill">
            {workflowCountLabel}
          </span>
          <span className="workflow-page-pill">
            {selectedWorkflowId ? `Run #${selectedWorkflowId}` : 'No run selected'}
          </span>
        </div>
      </header>

      {actionError && <p className="workflow-error" style={{ marginBottom: '16px' }}>{actionError}</p>}

      <SidebarProvider className="workflow-layout" style={workflowSidebarStyle}>
        <WorkflowSidebar
          usersData={usersData}
          usersLoading={usersLoading}
          usersError={usersError}
          selectedUserId={selectedUserId}
          usersPage={usersPage}
          totalUserPages={totalUserPages}
          workflows={workflows}
          workflowsLoading={workflowsLoading}
          workflowsError={workflowsError}
          selectedWorkflowId={selectedWorkflowId}
          continuingWorkflowId={continuingWorkflowId}
          workflowQuestion={workflowQuestion}
          startingWorkflow={startingWorkflow}
          onSelectUser={handleSelectUser}
          onPreviousUsersPage={() => setUsersPage((page) => Math.max(1, page - 1))}
          onNextUsersPage={() => setUsersPage((page) => Math.min(totalUserPages, page + 1))}
          onQuestionChange={setWorkflowQuestion}
          onStartWorkflow={handleStartWorkflow}
          onSelectWorkflow={setSelectedWorkflowId}
          onContinueWorkflow={handleContinueWorkflow}
          onOpenPolicies={() => setIsPolicyModalOpen(true)}
        />

        <SidebarInset className="workflow-main">
          <div className="workflow-top-row">
            <div className="workflow-top-col workflow-top-col--detail">
              <WorkflowDetailCard
                workflow={selectedWorkflow}
                loading={workflowLoading}
                error={workflowError}
                continuingWorkflowId={continuingWorkflowId}
                onContinueWorkflow={handleContinueWorkflow}
              />
            </div>
            <div className="workflow-top-col workflow-top-col--pipeline">
              <WorkflowPipeline workflow={selectedWorkflow} />
            </div>
          </div>

          <WorkflowOutputs workflow={selectedWorkflow} />
        </SidebarInset>
      </SidebarProvider>

      {isPolicyModalOpen && (
        <div className="workflow-policy-overlay" role="dialog" aria-modal="true" aria-label="User policies">
          <button
            type="button"
            className="workflow-policy-backdrop"
            aria-label="Close user policies"
            onClick={() => setIsPolicyModalOpen(false)}
          />
          <div className="workflow-policy-modal">
            <WorkflowUserPolicies
              workflow={selectedWorkflow}
              onClose={() => setIsPolicyModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
