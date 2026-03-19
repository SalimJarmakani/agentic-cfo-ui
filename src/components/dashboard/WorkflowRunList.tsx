import type { AgentWorkflowSummary } from '../../types';
import { canContinueWorkflow, formatWorkflowDate, workflowStageLabel, workflowStatusLabel } from './workflowFormat';

type Props = {
  workflows: AgentWorkflowSummary[];
  selectedWorkflowId: number | null;
  loading: boolean;
  continuingWorkflowId: number | null;
  onSelectWorkflow: (workflowRunId: number) => void;
  onContinueWorkflow: (workflowRunId: number) => void;
};

function WorkflowRunRow({
  workflow,
  isSelected,
  isContinuing,
  onSelectWorkflow,
  onContinueWorkflow,
}: {
  workflow: AgentWorkflowSummary;
  isSelected: boolean;
  isContinuing: boolean;
  onSelectWorkflow: (workflowRunId: number) => void;
  onContinueWorkflow: (workflowRunId: number) => void;
}) {
  const resumable = canContinueWorkflow(workflow);

  return (
    <div className={`workflow-run-item${isSelected ? ' workflow-run-item--active' : ''}`}>
      <button type="button" className="workflow-run-select" onClick={() => onSelectWorkflow(workflow.workflow_run_id)}>
        <span className="workflow-run-topline">
          <span className="workflow-run-id">Run #{workflow.workflow_run_id}</span>
          <span className={`workflow-status-pill workflow-status-pill--${workflow.status}`}>
            {workflowStatusLabel[workflow.status]}
          </span>
        </span>
        <span className="workflow-run-question">{workflow.question}</span>
        <span className="workflow-run-meta">
          Stage {workflowStageLabel[workflow.current_stage]} | Updated {formatWorkflowDate(workflow.updated_at)}
        </span>
      </button>

      {resumable && (
        <button
          type="button"
          className="workflow-secondary-btn"
          onClick={() => onContinueWorkflow(workflow.workflow_run_id)}
          disabled={isContinuing}
        >
          {isContinuing ? 'Continuing...' : 'Continue'}
        </button>
      )}
    </div>
  );
}

export default function WorkflowRunList({
  workflows,
  selectedWorkflowId,
  loading,
  continuingWorkflowId,
  onSelectWorkflow,
  onContinueWorkflow,
}: Props) {
  const resumable = workflows.filter(canContinueWorkflow);
  const history = workflows.filter((workflow) => !canContinueWorkflow(workflow));

  return (
    <section className="card workflow-card">
      <div className="workflow-card-head">
        <div>
          <h2 className="section-title">Workflow Runs</h2>
          <p className="workflow-muted">Continue an in-progress run or open a finished workflow.</p>
        </div>
      </div>

      {loading ? (
        <p className="workflow-muted">Loading workflows...</p>
      ) : workflows.length === 0 ? (
        <p className="workflow-muted">No workflow runs found for this user yet.</p>
      ) : (
        <div className="workflow-run-groups">
          <div className="workflow-run-group">
            <h3 className="workflow-subtitle">Ready to Continue</h3>
            {resumable.length === 0 ? (
              <p className="workflow-muted">No resumable runs.</p>
            ) : (
              resumable.map((workflow) => (
                <WorkflowRunRow
                  key={workflow.workflow_run_id}
                  workflow={workflow}
                  isSelected={workflow.workflow_run_id === selectedWorkflowId}
                  isContinuing={continuingWorkflowId === workflow.workflow_run_id}
                  onSelectWorkflow={onSelectWorkflow}
                  onContinueWorkflow={onContinueWorkflow}
                />
              ))
            )}
          </div>

          <div className="workflow-run-group">
            <h3 className="workflow-subtitle">History</h3>
            {history.length === 0 ? (
              <p className="workflow-muted">No finished or failed runs yet.</p>
            ) : (
              history.map((workflow) => (
                <WorkflowRunRow
                  key={workflow.workflow_run_id}
                  workflow={workflow}
                  isSelected={workflow.workflow_run_id === selectedWorkflowId}
                  isContinuing={continuingWorkflowId === workflow.workflow_run_id}
                  onSelectWorkflow={onSelectWorkflow}
                  onContinueWorkflow={onContinueWorkflow}
                />
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
