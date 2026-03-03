import StatCard from '../components/StatCard';
import './Page.css';

const agentSteps = [
  { label: 'Analysis Agent', status: 'done' },
  { label: 'Planning Agent', status: 'done' },
  { label: 'Policy Agent', status: 'running' },
  { label: 'Explanation Agent', status: 'idle' },
];

const statusClass: Record<string, string> = {
  done: 'agent-step--done',
  running: 'agent-step--running',
  idle: 'agent-step--idle',
  error: 'agent-step--error',
};

export default function Dashboard() {
  return (
    <div className="page">
      <h1 className="page-title">Overview</h1>
      <p className="page-sub">Financial summary and agent pipeline status</p>

      <div className="stat-grid">
        <StatCard label="Total Spend" value="$—" sub="This month" accent="blue" />
        <StatCard label="Potential Savings" value="$—" sub="From optimization" accent="green" />
        <StatCard label="Policy Score" value="—" sub="Compliance rating" accent="yellow" />
        <StatCard label="Active Subscriptions" value="—" sub="Recurring payments" accent="red" />
      </div>

      <section className="section">
        <h2 className="section-title">Agent Pipeline</h2>
        <div className="agent-pipeline">
          {agentSteps.map((step, i) => (
            <div key={step.label} className="agent-pipeline-step">
              <div className={`agent-step ${statusClass[step.status]}`}>
                <span className="agent-step-dot" />
                <span className="agent-step-label">{step.label}</span>
                <span className="agent-step-status">{step.status}</span>
              </div>
              {i < agentSteps.length - 1 && <div className="agent-pipeline-arrow">→</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
