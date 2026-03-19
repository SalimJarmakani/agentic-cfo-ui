import { useEffect, useState } from 'react';
import WorkflowDetailCard from '../components/dashboard/WorkflowDetailCard';
import WorkflowOutputs from '../components/dashboard/WorkflowOutputs';
import WorkflowPipeline from '../components/dashboard/WorkflowPipeline';
import WorkflowSidebar from '../components/dashboard/WorkflowSidebar';
import '../components/dashboard/DashboardWorkflow.css';
import { SidebarInset, SidebarProvider } from '../components/ui/Sidebar';
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
};

function isWorkflowStatus(value: string): value is WorkflowStatus {
  return value === 'running' || value === 'waiting_for_user' || value === 'completed' || value === 'failed';
}

function isWorkflowStage(value: string): value is WorkflowStage {
  return value === 'analysis' || value === 'planning' || value === 'policy' || value === 'done' || value === 'failed';
}

function isWorkflowStepName(value: string): value is WorkflowStepName {
  return value === 'analysis' || value === 'planning' || value === 'policy';
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

    setWorkflowLoading(true);
    setWorkflowError(null);

    fetchAgentWorkflow(selectedWorkflowId)
      .then((response) => {
        if (!cancelled) setSelectedWorkflow(normalizeWorkflow(response));
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setSelectedWorkflow(null);
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

    setStartingWorkflow(true);
    setActionError(null);

    try {
      const workflow = normalizeWorkflow(await startAgentWorkflow(selectedUserId, workflowQuestion.trim()));
      setSelectedWorkflow(workflow);
      setSelectedWorkflowId(workflow.workflow_run_id);
      await refreshWorkflowList(selectedUserId, workflow.workflow_run_id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Failed to start workflow.');
    } finally {
      setStartingWorkflow(false);
    }
  }

  async function handleContinueWorkflow(workflowRunId: number) {
    if (!selectedUserId) return;

    setContinuingWorkflowId(workflowRunId);
    setActionError(null);

    try {
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
      <h1 className="page-title">Workflow Dashboard</h1>
      <p className="page-sub">Select a user, continue active runs, and review agent outputs for previous workflows.</p>

      {actionError && <p className="workflow-error" style={{ marginBottom: '16px' }}>{actionError}</p>}

      <SidebarProvider className="workflow-layout">
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
    </div>
  );
}
