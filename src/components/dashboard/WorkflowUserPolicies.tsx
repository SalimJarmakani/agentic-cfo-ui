import type { AgentWorkflow, PolicyRule } from '../../types';

type PolicyDisplayStatus = PolicyRule['status'] | 'static';

type PolicyDisplayRule = {
  id: string;
  name: string;
  description: string;
  status: PolicyDisplayStatus;
  detail: string;
};

type LivePolicyRule = {
  id: string;
  name: string;
  description: string;
  status: PolicyRule['status'];
  detail: string;
};

type DerivedPolicyState = {
  overallStatus: PolicyRule['status'] | null;
  score: number | null;
  rules: PolicyDisplayRule[];
  isStatic: boolean;
  note: string;
};

const STATIC_POLICY_RULES: PolicyDisplayRule[] = [
  {
    id: 'rule-1',
    name: 'Spending-to-Income Ratio',
    description: 'Monthly average spend should not exceed 90% of monthly income.',
    status: 'static',
    detail: 'Configured dashboard policy. Live workflow findings will appear here after policy data is available.',
  },
  {
    id: 'rule-2',
    name: 'Debt-to-Income Ratio',
    description: 'Total debt should not exceed 50% of annual income.',
    status: 'static',
    detail: 'Configured dashboard policy. Live workflow findings will appear here after policy data is available.',
  },
  {
    id: 'rule-3',
    name: 'Fraud Merchant Exposure',
    description: 'Less than 15% of transactions should occur at high-fraud-rate merchants.',
    status: 'static',
    detail: 'Configured dashboard policy. Live workflow findings will appear here after policy data is available.',
  },
  {
    id: 'rule-4',
    name: 'Spending Concentration',
    description: 'No single category should account for more than 70% of total spend.',
    status: 'static',
    detail: 'Configured dashboard policy. Live workflow findings will appear here after policy data is available.',
  },
];

function getObject(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getNumber(value: unknown): number | null {
  return typeof value === 'number' && !Number.isNaN(value) ? value : null;
}

function isPolicyStatus(value: string): value is PolicyRule['status'] {
  return value === 'compliant' || value === 'warning' || value === 'violation';
}

function normalizePolicyName(name: string): string {
  return name.trim().toLowerCase();
}

function getPolicyRules(value: unknown): LivePolicyRule[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const record = getObject(item);
      if (!record) return null;

      const name = getString(record.name);
      const id = getString(record.id) || name;
      const description = getString(record.description);
      const detail = getString(record.detail);
      const statusValue = getString(record.status).toLowerCase();

      if (!name || !detail || !isPolicyStatus(statusValue)) {
        return null;
      }

      return {
        id,
        name,
        description,
        detail,
        status: statusValue,
      } satisfies LivePolicyRule;
    })
    .filter((item): item is LivePolicyRule => item !== null);
}

function derivePolicyState(workflow: AgentWorkflow | null): DerivedPolicyState {
  if (!workflow) {
    return {
      overallStatus: null,
      score: null,
      rules: STATIC_POLICY_RULES,
      isStatic: true,
      note: 'Select a workflow to replace these static policy definitions with workflow-backed policy findings.',
    };
  }

  const policyStep = workflow.steps.find((step) => step.step_name === 'policy');
  const policyInput = getObject(policyStep?.input_payload);
  const policyOutput = getObject(policyStep?.output_payload);
  const workflowUserPolicy = getObject(policyInput?.user_policy);

  const inputRules = getPolicyRules(workflowUserPolicy?.rules);
  const outputRules = getPolicyRules(policyOutput?.user_policy_findings);
  const liveRules = inputRules.length > 0 ? inputRules : outputRules;

  if (liveRules.length === 0) {
    return {
      overallStatus: null,
      score: null,
      rules: STATIC_POLICY_RULES,
      isStatic: true,
      note: 'This workflow has not surfaced user policy findings yet, so the dashboard is showing the configured static policy set.',
    };
  }

  const liveRuleMap = new Map(liveRules.map((rule) => [normalizePolicyName(rule.name), rule]));

  const mergedRules = STATIC_POLICY_RULES.map((rule) => {
    const liveRule = liveRuleMap.get(normalizePolicyName(rule.name));
    if (!liveRule) return rule;

    return {
      ...rule,
      status: liveRule.status,
      description: liveRule.description || rule.description,
      detail: liveRule.detail,
    };
  });

  const extraRules = liveRules.filter(
    (rule) => !STATIC_POLICY_RULES.some((item) => normalizePolicyName(item.name) === normalizePolicyName(rule.name)),
  );

  const overallStatusValue =
    getString(workflowUserPolicy?.overall_status).toLowerCase() ||
    getString(policyOutput?.user_policy_status).toLowerCase();

  return {
    overallStatus: isPolicyStatus(overallStatusValue) ? overallStatusValue : null,
    score: getNumber(workflowUserPolicy?.score) ?? getNumber(policyOutput?.user_policy_score),
    rules: [...mergedRules, ...extraRules],
    isStatic: false,
    note: 'Live policy findings are being read from the selected workflow.',
  };
}

function statusLabel(status: PolicyDisplayStatus): string {
  return status === 'static' ? 'configured' : status;
}

function statusClassName(status: PolicyDisplayStatus): string {
  return status === 'static'
    ? 'workflow-status-pill--policy-static'
    : `workflow-status-pill--priority-${status}`;
}

type Props = {
  workflow: AgentWorkflow | null;
  onClose?: () => void;
};

export default function WorkflowUserPolicies({ workflow, onClose }: Props) {
  const state = derivePolicyState(workflow);

  return (
    <section className="card workflow-card workflow-policy-card">
      <div className="workflow-card-head workflow-card-head--section">
        <div>
          <h2 className="section-title">User Policies</h2>
          <p className="workflow-muted">{state.note}</p>
        </div>

        <div className="workflow-policy-meta">
          {state.overallStatus && (
            <span className={`workflow-status-pill workflow-status-pill--priority-${state.overallStatus}`}>
              {state.overallStatus}
            </span>
          )}
          {state.score !== null && <span className="workflow-policy-score">Score {state.score}</span>}
          {onClose && (
            <button type="button" className="workflow-policy-close-btn" onClick={onClose} aria-label="Close user policies">
              Close
            </button>
          )}
        </div>
      </div>

      <div className="workflow-policy-list">
        {state.rules.map((rule) => (
          <article key={rule.id} className="workflow-policy-item">
            <div className="workflow-policy-item-head">
              <div>
                <h3 className="workflow-policy-name">{rule.name}</h3>
                <p className="workflow-policy-description">{rule.description}</p>
              </div>
              <span className={`workflow-status-pill ${statusClassName(rule.status)}`}>
                {statusLabel(rule.status)}
              </span>
            </div>

            <p className="workflow-policy-detail">{rule.detail}</p>
          </article>
        ))}
      </div>

      {state.isStatic && (
        <p className="workflow-policy-footnote">
          Static policy cards help keep the dashboard readable before the policy stage has completed.
        </p>
      )}
    </section>
  );
}
