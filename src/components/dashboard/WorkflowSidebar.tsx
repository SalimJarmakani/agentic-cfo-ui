import { useState } from 'react';
import type { PaginatedUsersResponse } from '../../services/api';
import type { AgentWorkflowSummary } from '../../types';
import WorkflowComposer from './WorkflowComposer';
import WorkflowRunList from './WorkflowRunList';
import WorkflowUserPicker from './WorkflowUserPicker';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from '../ui/Sidebar';

type SidebarTab = 'users' | 'start' | 'runs';

type Props = {
  usersData: PaginatedUsersResponse | null;
  usersLoading: boolean;
  usersError: string | null;
  selectedUserId: number | null;
  usersPage: number;
  totalUserPages: number;
  workflows: AgentWorkflowSummary[];
  workflowsLoading: boolean;
  workflowsError: string | null;
  selectedWorkflowId: number | null;
  continuingWorkflowId: number | null;
  workflowQuestion: string;
  startingWorkflow: boolean;
  onSelectUser: (userId: number) => void;
  onPreviousUsersPage: () => void;
  onNextUsersPage: () => void;
  onQuestionChange: (value: string) => void;
  onStartWorkflow: () => void;
  onSelectWorkflow: (workflowRunId: number) => void;
  onContinueWorkflow: (workflowRunId: number) => void;
};

const tabs: Array<{ id: SidebarTab; label: string; shortLabel: string }> = [
  { id: 'users', label: 'Users', shortLabel: 'U' },
  { id: 'start', label: 'Start', shortLabel: 'S' },
  { id: 'runs', label: 'History', shortLabel: 'H' },
];

export default function WorkflowSidebar({
  usersData,
  usersLoading,
  usersError,
  selectedUserId,
  usersPage,
  totalUserPages,
  workflows,
  workflowsLoading,
  workflowsError,
  selectedWorkflowId,
  continuingWorkflowId,
  workflowQuestion,
  startingWorkflow,
  onSelectUser,
  onPreviousUsersPage,
  onNextUsersPage,
  onQuestionChange,
  onStartWorkflow,
  onSelectWorkflow,
  onContinueWorkflow,
}: Props) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('users');
  const { open } = useSidebar();

  return (
    <Sidebar className="workflow-sidebar-shell">
      <SidebarHeader className="workflow-sidebar-head">
        <div className="workflow-sidebar-title-wrap">
          <span className="workflow-sidebar-eyebrow">Workspace</span>
          {open && (
            <>
              <h2 className="workflow-sidebar-title">Workflow Controls</h2>
              <p className="workflow-sidebar-subtitle">Users, new runs, and history live here.</p>
            </>
          )}
        </div>
        <SidebarTrigger
          className="workflow-sidebar-toggle"
          aria-label={open ? 'Collapse workflow sidebar' : 'Expand workflow sidebar'}
        >
          {open ? '<' : '>'}
        </SidebarTrigger>
      </SidebarHeader>

      <SidebarContent>
        <div className="workflow-sidebar-tabs" role="tablist" aria-label="Workflow sidebar tabs">
          {open && <span className="workflow-sidebar-group-label">Browse</span>}
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`workflow-sidebar-tab${activeTab === tab.id ? ' workflow-sidebar-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              <span className="workflow-sidebar-tab-short">{tab.shortLabel}</span>
              {open && <span>{tab.label}</span>}
            </button>
          ))}
        </div>

        {open && (
          <SidebarGroup className="workflow-sidebar-body">
            <div className="workflow-sidebar-panel">
              {activeTab === 'users' && (
                <WorkflowUserPicker
                  users={usersData?.items ?? []}
                  selectedUserId={selectedUserId}
                  page={usersPage}
                  totalPages={totalUserPages}
                  loading={usersLoading}
                  error={usersError}
                  onSelectUser={onSelectUser}
                  onPreviousPage={onPreviousUsersPage}
                  onNextPage={onNextUsersPage}
                />
              )}

              {activeTab === 'start' && (
                <WorkflowComposer
                  selectedUserId={selectedUserId}
                  question={workflowQuestion}
                  loading={startingWorkflow}
                  onQuestionChange={onQuestionChange}
                  onSubmit={onStartWorkflow}
                />
              )}

              {activeTab === 'runs' && (
                <>
                  <WorkflowRunList
                    workflows={workflows}
                    selectedWorkflowId={selectedWorkflowId}
                    loading={workflowsLoading}
                    continuingWorkflowId={continuingWorkflowId}
                    onSelectWorkflow={onSelectWorkflow}
                    onContinueWorkflow={onContinueWorkflow}
                  />
                  {workflowsError && <p className="workflow-error">{workflowsError}</p>}
                </>
              )}
            </div>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
