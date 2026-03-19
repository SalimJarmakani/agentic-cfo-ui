import { useRef } from 'react';
import type { AgentWorkflow } from '../../types';
import AgentOutputCard from './AgentOutputCard';

type Props = {
  workflow: AgentWorkflow | null;
};

export default function WorkflowOutputs({ workflow }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

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
    <section className="section">
      <div className="workflow-card-head workflow-card-head--section">
        <div>
          <h2 className="section-title">Agent Outputs</h2>
          <p className="workflow-muted">Scroll sideways to compare each agent card in one row.</p>
        </div>
        {!!workflow && (
          <div className="workflow-output-controls">
            <button
              type="button"
              className="workflow-output-scroll-btn"
              onClick={() => scrollOutputs('left')}
              aria-label="Scroll agent outputs left"
            >
              Prev
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
