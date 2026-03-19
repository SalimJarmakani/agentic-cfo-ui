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
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '../ui/sidebar';
import { HistoryIcon, PlayIcon, UsersIcon } from 'lucide-react';

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

const tabs: Array<{
  id: SidebarTab;
  label: string;
  icon: typeof UsersIcon;
}> = [
  { id: 'users', label: 'Users', icon: UsersIcon },
  { id: 'start', label: 'Start', icon: PlayIcon },
  { id: 'runs', label: 'History', icon: HistoryIcon },
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
  const { open, setOpen } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="floating" className="workflow-sidebar-shell">
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
        />
      </SidebarHeader>

      <SidebarContent className="workflow-sidebar-content">
        <SidebarGroup className="workflow-sidebar-tabs">
          <SidebarGroupLabel className="workflow-sidebar-group-label">Browse</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu role="tablist" aria-label="Workflow sidebar tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <SidebarMenuItem key={tab.id}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={tab.label}
                      className="workflow-sidebar-menu-button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (!open) setOpen(true);
                      }}
                      role="tab"
                      aria-selected={active}
                    >
                      <Icon />
                      <span>{tab.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {open && (
          <>
            <SidebarSeparator />
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
          </>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
