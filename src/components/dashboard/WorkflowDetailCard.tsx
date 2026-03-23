import type { AgentWorkflow } from '../../types';
import { canContinueWorkflow, canRerunWorkflow, formatWorkflowDate, workflowStageLabel, workflowStatusLabel } from './workflowFormat';

type Props = {
  workflow: AgentWorkflow | null;
  loading: boolean;
  error: string | null;
  continuingWorkflowId: number | null;
  onContinueWorkflow: (workflowRunId: number) => void;
};

export default function WorkflowDetailCard({
  workflow,
  loading,
  error,
  continuingWorkflowId,
  onContinueWorkflow,
}: Props) {
  const resumable = workflow ? canContinueWorkflow(workflow) || canRerunWorkflow(workflow) : false;
  const actionLabel = workflow && canRerunWorkflow(workflow) ? 'Rerun from last success' : 'Continue run';
  const pendingLabel = workflow && canRerunWorkflow(workflow) ? 'Rerunning...' : 'Continuing...';

  return (
    <section className="card workflow-card workflow-detail-shell">
      <div className="workflow-detail-hero workflow-detail-hero--compact">
        <div>
          <h2 className="section-title">Workflow Workspace</h2>
          <p className="workflow-muted">Compact run metadata, with the pipeline and outputs below.</p>
        </div>
        {workflow && resumable && (
          <button
            type="button"
            className="workflow-primary-btn"
            disabled={continuingWorkflowId === workflow.workflow_run_id}
            onClick={() => onContinueWorkflow(workflow.workflow_run_id)}
          >
            {continuingWorkflowId === workflow.workflow_run_id ? pendingLabel : actionLabel}
          </button>
        )}
      </div>

      {loading ? (
        <p className="workflow-muted">Loading workflow...</p>
      ) : error ? (
        <p className="workflow-error">{error}</p>
      ) : !workflow ? (
        <p className="workflow-muted">Select a workflow from the sidebar to inspect it.</p>
      ) : (
        <>
          <table className="workflow-detail-table">
            <tbody>
              <tr>
                <th>Run</th>
                <td>#{workflow.workflow_run_id}</td>
                <th>User</th>
                <td>{workflow.user_id}</td>
                <th>Status</th>
                <td>
                  <span className={`workflow-status-pill workflow-status-pill--${workflow.status}`}>
                    {workflowStatusLabel[workflow.status]}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Stage</th>
                <td>{workflowStageLabel[workflow.current_stage]}</td>
                <th>Created</th>
                <td>{formatWorkflowDate(workflow.created_at)}</td>
                <th>Updated</th>
                <td>{formatWorkflowDate(workflow.updated_at)}</td>
              </tr>
            </tbody>
          </table>

          <p className="workflow-detail-question">{workflow.question}</p>
        </>
      )}
    </section>
  );
}
