import { useRef } from 'react';
import type { AgentWorkflow } from '../../types';
import AgentOutputCard from './AgentOutputCard';

type Props = {
  workflow: AgentWorkflow | null;
};

export default function WorkflowOutputs({ workflow }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const outputCount = workflow?.steps.length ?? 0;

  function scrollOutputs(direction: 'left' | 'right') {
    const container = scrollRef.current;
    if (!container) return;

    const distance = Math.max(container.clientWidth * 0.8, 280);
    container.scrollBy({
      left: direction === 'right' ? distance : -distance,
      behavior: 'smooth',
    });
  }

  return (
    <section className="section workflow-output-section">
      <div className="workflow-card-head workflow-card-head--section">
        <div className="workflow-output-header-copy">
          <span className="workflow-output-eyebrow">Workflow Review</span>
          <div className="workflow-output-title-row">
            <h2 className="workflow-output-title">Agent Outputs</h2>
            {workflow && <span className="workflow-output-count">{outputCount} stages</span>}
          </div>
          <p className="workflow-output-subtitle">Scroll sideways to compare each agent card without leaving the dashboard.</p>
        </div>
        {!!workflow && (
          <div className="workflow-output-controls" aria-label="Agent output navigation">
            <button
              type="button"
              className="workflow-output-scroll-btn"
              onClick={() => scrollOutputs('left')}
              aria-label="Scroll agent outputs left"
            >
              Previous
            </button>
            <button
              type="button"
              className="workflow-output-scroll-btn"
              onClick={() => scrollOutputs('right')}
              aria-label="Scroll agent outputs right"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {!workflow ? (
        <div className="card workflow-card">
          <p className="workflow-muted">Select a workflow to view agent outputs.</p>
        </div>
      ) : (
        <div ref={scrollRef} className="workflow-output-grid">
          {workflow.steps.map((step) => (
            <AgentOutputCard key={step.workflow_step_id} step={step} />
          ))}
        </div>
      )}
    </section>
  );
}
