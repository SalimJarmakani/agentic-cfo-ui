import type { WorkflowStep } from '../../types';
import { workflowStepStatusLabel, workflowStepTitle } from './workflowFormat';

type Props = {
  step: WorkflowStep;
};

type ActionItem = {
  title: string;
  details: string;
  priority: string;
};

type PolicyCheckItem = {
  id: string;
  name: string;
  status: string;
  detail: string;
};

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getStringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];
}

function getActionList(value: unknown): ActionItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      title: getString(item.title),
      details: getString(item.details),
      priority: getString(item.priority) || 'medium',
    }))
    .filter((item) => item.title && item.details);
}

function getBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function getNumber(value: unknown): number | null {
  return typeof value === 'number' && !Number.isNaN(value) ? value : null;
}

function getPolicyCheckList(value: unknown): PolicyCheckItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      id: getString(item.id) || getString(item.name),
      name: getString(item.name),
      status: getString(item.status) || 'review',
      detail: getString(item.detail),
    }))
    .filter((item) => item.id && item.name && item.detail);
}

function AnalysisOutput({ payload }: { payload: Record<string, unknown> }) {
  const summary = getString(payload.summary);
  const risks = getStringList(payload.risks);
  const opportunities = getStringList(payload.opportunities);
  const nextActions = getStringList(payload.next_actions);

  return (
    <div className="agent-output-body">
      {summary && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Summary</h4>
          <p className="agent-output-copy">{summary}</p>
        </div>
      )}

      {risks.length > 0 && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Risks</h4>
          <ul className="agent-output-list">
            {risks.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      {opportunities.length > 0 && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Opportunities</h4>
          <ul className="agent-output-list">
            {opportunities.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      {nextActions.length > 0 && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Next Actions</h4>
          <ul className="agent-output-list">
            {nextActions.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function PlanningOutput({ payload }: { payload: Record<string, unknown> }) {
  const goal = getString(payload.goal);
  const actions = getActionList(payload.actions);
  const checkpoints = getStringList(payload.checkpoints);

  return (
    <div className="agent-output-body">
      {goal && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Goal</h4>
          <p className="agent-output-copy">{goal}</p>
        </div>
      )}

      {actions.length > 0 && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Actions</h4>
          <div className="agent-output-action-list">
            {actions.map((action) => (
              <div key={`${action.priority}-${action.title}`} className="agent-output-action">
                <div className="agent-output-action-topline">
                  <span className="agent-output-action-title">{action.title}</span>
                  <span className={`workflow-status-pill workflow-status-pill--priority-${action.priority.toLowerCase()}`}>
                    {action.priority}
                  </span>
                </div>
                <p className="agent-output-copy">{action.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {checkpoints.length > 0 && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Checkpoints</h4>
          <ul className="agent-output-list">
            {checkpoints.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function PolicyOutput({ payload }: { payload: Record<string, unknown> }) {
  const summary = getString(payload.summary);
  const approved = getBoolean(payload.approved);
  const requiresHumanReview = getBoolean(payload.requires_human_review);
  const userPolicyStatus = getString(payload.user_policy_status);
  const userPolicyScore = getNumber(payload.user_policy_score);
  const aiRiskChecks = getPolicyCheckList(payload.ai_risk_checks);
  const userPolicyFindings = getPolicyCheckList(payload.user_policy_findings);
  const guardrails = getStringList(payload.guardrails);
  const blockedActions = getStringList(payload.blocked_actions);

  return (
    <div className="agent-output-body">
      {summary && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Summary</h4>
          <p className="agent-output-copy">{summary}</p>
        </div>
      )}

      {(approved !== null || requiresHumanReview !== null || userPolicyStatus || userPolicyScore !== null) && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Decision</h4>
          <ul className="agent-output-list">
            {approved !== null && <li>{approved ? 'Approved for display to the user.' : 'Blocked by policy review.'}</li>}
            {requiresHumanReview !== null && (
              <li>{requiresHumanReview ? 'Human review is required.' : 'No extra human review is required.'}</li>
            )}
            {userPolicyStatus && <li>User policy status: {userPolicyStatus}</li>}
            {userPolicyScore !== null && <li>User policy score: {userPolicyScore}</li>}
          </ul>
        </div>
      )}

      {aiRiskChecks.length > 0 && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">AI Risk Checks</h4>
          <div className="agent-output-action-list">
            {aiRiskChecks.map((item) => (
              <div key={item.id} className="agent-output-action">
                <div className="agent-output-action-topline">
                  <span className="agent-output-action-title">{item.name}</span>
                  <span className={`workflow-status-pill workflow-status-pill--priority-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>
                <p className="agent-output-copy">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {userPolicyFindings.length > 0 && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">User Policy Findings</h4>
          <div className="agent-output-action-list">
            {userPolicyFindings.map((item) => (
              <div key={item.id} className="agent-output-action">
                <div className="agent-output-action-topline">
                  <span className="agent-output-action-title">{item.name}</span>
                  <span className={`workflow-status-pill workflow-status-pill--priority-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </div>
                <p className="agent-output-copy">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {guardrails.length > 0 && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Guardrails</h4>
          <ul className="agent-output-list">
            {guardrails.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      {blockedActions.length > 0 && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Blocked Actions</h4>
          <ul className="agent-output-list">
            {blockedActions.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function ExplanationOutput({ payload }: { payload: Record<string, unknown> }) {
  const headline = getString(payload.headline);
  const summary = getString(payload.summary);
  const keyPoints = getStringList(payload.key_points);
  const recommendedNextSteps = getStringList(payload.recommended_next_steps);
  const policyNote = getString(payload.policy_note);

  return (
    <div className="agent-output-body">
      {headline && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Headline</h4>
          <p className="agent-output-copy">{headline}</p>
        </div>
      )}

      {summary && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Summary</h4>
          <p className="agent-output-copy">{summary}</p>
        </div>
      )}

      {keyPoints.length > 0 && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Key Points</h4>
          <ul className="agent-output-list">
            {keyPoints.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      {recommendedNextSteps.length > 0 && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Recommended Next Steps</h4>
          <ul className="agent-output-list">
            {recommendedNextSteps.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      )}

      {policyNote && (
        <div className="agent-output-section">
          <h4 className="agent-output-heading">Policy Note</h4>
          <p className="agent-output-copy">{policyNote}</p>
        </div>
      )}
    </div>
  );
}

function PendingOutput({ step }: { step: WorkflowStep }) {
  if (step.status === 'failed') {
    return <p className="workflow-error">{step.error_message || 'This step failed before producing output.'}</p>;
  }

  if (step.status === 'completed' && !step.output_payload) {
    return <p className="workflow-muted">This step completed without a stored output payload.</p>;
  }

  if (step.status === 'running') {
    return <p className="workflow-muted">This agent is still running.</p>;
  }

  return <p className="workflow-muted">This agent has not produced output yet.</p>;
}

export default function AgentOutputCard({ step }: Props) {
  const payload = step.output_payload && typeof step.output_payload === 'object' ? step.output_payload : null;
  const inputTokens = typeof payload?.input_tokens === 'number' ? payload.input_tokens : null;

  return (
    <article className="card workflow-card agent-output-card">
      <div className="workflow-card-head">
        <div className="agent-output-header-copy">
          <span className="agent-output-stage-label">{step.step_name}</span>
          <h3 className="agent-output-title">{workflowStepTitle[step.step_name]}</h3>
          <p className="agent-output-subtitle">Output captured for the {step.step_name} stage.</p>
        </div>
        <div className="agent-output-meta">
          <span className={`workflow-status-pill workflow-status-pill--${step.status === 'completed' ? 'completed' : step.status === 'failed' ? 'failed' : step.status === 'running' ? 'running' : 'idle'}`}>
            {workflowStepStatusLabel[step.status]}
          </span>
          {inputTokens !== null && <span className="workflow-muted">Input tokens {inputTokens}</span>}
        </div>
      </div>

      {!payload ? (
        <PendingOutput step={step} />
      ) : step.step_name === 'analysis' ? (
        <AnalysisOutput payload={payload} />
      ) : step.step_name === 'planning' ? (
        <PlanningOutput payload={payload} />
      ) : step.step_name === 'policy' ? (
        <PolicyOutput payload={payload} />
      ) : (
        <ExplanationOutput payload={payload} />
      )}
    </article>
  );
}
