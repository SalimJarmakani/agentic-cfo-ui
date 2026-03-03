import './Page.css';

const mockRules = [
  {
    id: '1',
    name: 'Savings Rate',
    description: 'At least 20% of income should go to savings.',
    status: 'compliant' as const,
    detail: 'Current savings rate: 23%',
  },
  {
    id: '2',
    name: 'Discretionary Spending Cap',
    description: 'Discretionary spend should not exceed 30% of income.',
    status: 'warning' as const,
    detail: 'Current discretionary spend: 28% — approaching limit',
  },
  {
    id: '3',
    name: 'Recurring Debt Payments',
    description: 'Debt payments should not exceed 15% of income.',
    status: 'violation' as const,
    detail: 'Current debt payments: 19% — exceeds threshold',
  },
  {
    id: '4',
    name: 'Emergency Fund',
    description: 'At least 3 months of expenses in liquid savings.',
    status: 'compliant' as const,
    detail: 'Current fund: 4.2 months of expenses',
  },
];

const statusIcon = {
  compliant: '✓',
  warning: '⚠',
  violation: '✕',
};

const statusClass = {
  compliant: 'rule-card--compliant',
  warning: 'rule-card--warning',
  violation: 'rule-card--violation',
};

const scoreColor = (score: number) => {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#eab308';
  return '#ef4444';
};

const mockScore = 72;

export default function PolicyCompliance() {
  return (
    <div className="page">
      <h1 className="page-title">Policy Compliance</h1>
      <p className="page-sub">Rule-based compliance evaluation from the policy agent</p>

      <div className="card compliance-score-card">
        <span className="compliance-score-label">Overall Compliance Score</span>
        <span
          className="compliance-score-value"
          style={{ color: scoreColor(mockScore) }}
        >
          {mockScore} / 100
        </span>
        <div className="compliance-bar-track">
          <div
            className="compliance-bar-fill"
            style={{ width: `${mockScore}%`, background: scoreColor(mockScore) }}
          />
        </div>
      </div>

      <div className="rule-list">
        {mockRules.map((rule) => (
          <div key={rule.id} className={`card rule-card ${statusClass[rule.status]}`}>
            <div className="rule-header">
              <span className="rule-icon">{statusIcon[rule.status]}</span>
              <span className="rule-name">{rule.name}</span>
              <span className={`badge badge--${rule.status === 'compliant' ? 'green' : rule.status === 'warning' ? 'yellow' : 'red'}`}>
                {rule.status}
              </span>
            </div>
            <p className="rule-desc">{rule.description}</p>
            <p className="rule-detail">{rule.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
