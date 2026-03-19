import type { AgentWorkflow, WorkflowStep } from '../../types';
import { workflowStepStatusLabel, workflowStepTitle } from './workflowFormat';

const statusClass: Record<WorkflowStep['status'], string> = {
  pending: 'agent-step--idle',
  running: 'agent-step--running',
  completed: 'agent-step--done',
  failed: 'agent-step--error',
};

function AgentIcon({ status }: { status: WorkflowStep['status'] }) {
  if (status === 'completed') return <span className="agent-step-check">OK</span>;
  if (status === 'running') return <span className="agent-step-spinner">...</span>;
  if (status === 'failed') return <span className="agent-step-check agent-step-check--error">X</span>;
  return <span className="agent-step-dot" />;
}

type Props = {
  workflow: AgentWorkflow | null;
};

export default function WorkflowPipeline({ workflow }: Props) {
  return (
    <section className="card workflow-card">
      <div className="workflow-card-head">
        <div>
          <h2 className="section-title">Agent Pipeline</h2>
          <p className="workflow-muted">Each stage shows the current workflow state.</p>
        </div>
      </div>

      {!workflow ? (
        <p className="workflow-muted">Select a workflow to inspect its pipeline.</p>
      ) : (
        <div className="agent-pipeline">
          {workflow.steps.map((step, index) => (
            <div key={step.workflow_step_id} className="agent-pipeline-step">
              <div className={`agent-step ${statusClass[step.status]}`}>
                <AgentIcon status={step.status} />
                <span className="agent-step-label">{workflowStepTitle[step.step_name]}</span>
                <span className="agent-step-status">{workflowStepStatusLabel[step.status]}</span>
              </div>
              {index < workflow.steps.length - 1 && <div className="agent-pipeline-arrow">{'>'}</div>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
