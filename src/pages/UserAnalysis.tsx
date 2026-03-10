import { useState, useEffect } from 'react';
import { fetchUserAnalysis } from '../services/api';
import type { UserAnalysis } from '../types';
import StatCard from '../components/StatCard';
import './Page.css';
import './UserAnalysis.css';

const barAccent = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b', '#f97316'];

const ruleIconClass: Record<string, string> = {
  compliant: 'analysis-rule-icon--compliant',
  warning:   'analysis-rule-icon--warning',
  violation: 'analysis-rule-icon--violation',
};

const ruleIcon: Record<string, string> = {
  compliant: '✓',
  warning:   '⚠',
  violation: '✕',
};

const statusBadgeColor: Record<string, string> = {
  compliant: 'badge--green',
  warning:   'badge--yellow',
  violation: 'badge--red',
};

const scoreColor = (score: number) => {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#eab308';
  return '#ef4444';
};

const USER_ID = 2;

function formatDate(ts: string | null | undefined) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function AnalysisText({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  const pendingBullets: string[] = [];

  const flushBullets = (key: number) => {
    if (pendingBullets.length === 0) return;
    elements.push(
      <ul key={`ul-${key}`} className="analysis-bullets">
        {pendingBullets.map((b, i) => (
          <li key={i}>{renderInline(b)}</li>
        ))}
      </ul>
    );
    pendingBullets.length = 0;
  };

  lines.forEach((raw, i) => {
    const line = raw.trim();

    // Skip lone asterisks or empty lines
    if (!line || line === '*' || line === '-') {
      flushBullets(i);
      return;
    }

    // Heading: ### or ##
    if (/^#{2,3}\s+/.test(line)) {
      flushBullets(i);
      const title = line.replace(/^#{2,3}\s+/, '');
      elements.push(
        <h3 key={i} className="analysis-section-heading">{title}</h3>
      );
      return;
    }

    // Bullet: * or -
    if (/^[*-]\s+/.test(line)) {
      pendingBullets.push(line.replace(/^[*-]\s+/, ''));
      return;
    }

    // Regular paragraph
    flushBullets(i);
    elements.push(
      <p key={i} className="analysis-para">{renderInline(line)}</p>
    );
  });

  flushBullets(lines.length);

  return <div className="analysis-formatted">{elements}</div>;
}

export default function UserAnalysis() {
  const [data, setData] = useState<UserAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchUserAnalysis(USER_ID)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p style={{ color: '#64748b', padding: '2rem' }}>Loading analysis…</p></div>;
  if (error)   return <div className="page"><p style={{ color: '#ef4444', padding: '2rem' }}>{error}</p></div>;
  if (!data)   return null;

  const {
    user_spending_summary: summary,
    user_spending_graph:   graph,
    optimization,
    policy,
    recent_transactions,
  } = data.supporting_data;

  const topCategories = graph.categories.slice(0, 8);
  const policyColor   = scoreColor(policy.score);

  return (
    <div className="page analysis-page">

      {/* ── Header ── */}
      <div className="analysis-header">
        <div>
          <h1 className="page-title">Financial Analysis</h1>
          <p className="page-sub">
            User {data.user_id}
            {' · '}{summary.txn_count.toLocaleString()} transactions
            {' · '}{formatDate(summary.first_txn_ts)} – {formatDate(summary.last_txn_ts)}
          </p>
        </div>
        <span className={`badge analysis-status-badge ${statusBadgeColor[policy.overall_status]}`}>
          {policy.overall_status.charAt(0).toUpperCase() + policy.overall_status.slice(1)}
        </span>
      </div>

      {/* ── Stat cards ── */}
      <div className="stat-grid">
        <StatCard label="Total Spend"    value={`$${summary.total_spend.toLocaleString()}`}                      sub="All-time"        accent="blue"   />
        <StatCard label="Transactions"   value={summary.txn_count.toLocaleString()}                              sub="All-time"        accent="blue"   />
        <StatCard label="Avg. Ticket"    value={`$${summary.avg_ticket.toFixed(2)}`}                             sub="Per transaction" accent="yellow" />
        <StatCard label="Est. Savings"   value={`$${optimization.total_estimated_savings.toLocaleString()}`}     sub="Identified"      accent="green"  />
        <StatCard
          label="Policy Score"
          value={`${policy.score} / 100`}
          sub={policy.overall_status.charAt(0).toUpperCase() + policy.overall_status.slice(1)}
          accent={policy.score >= 75 ? 'green' : policy.score >= 50 ? 'yellow' : 'red'}
        />
      </div>

      {/* ── Row 1: Spending chart + Policy compliance ── */}
      <div className="analysis-grid analysis-grid--6040">

        <div className="card">
          <h2 className="section-title">
            Top Spending Categories
            <span className="section-title-meta">top {topCategories.length} of {graph.categories.length}</span>
          </h2>
          <div className="analysis-bar-list">
            {topCategories.map((cat, i) => (
              <div key={cat.category} className="analysis-bar-row">
                <div className="analysis-bar-top">
                  <span className="analysis-bar-label" title={cat.category}>{cat.category}</span>
                  <div className="analysis-bar-meta">
                    <span className="analysis-bar-amount">${cat.amount.toLocaleString()}</span>
                    <span className="analysis-bar-pct">{cat.percentage}%</span>
                  </div>
                </div>
                <div className="analysis-bar-track">
                  <div
                    className="analysis-bar-fill"
                    style={{ width: `${cat.percentage}%`, background: barAccent[i % barAccent.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">Policy Compliance</h2>
          <div className="analysis-score-row">
            <span className="analysis-score-value" style={{ color: policyColor }}>
              {policy.score}
              <span className="analysis-score-denom">/100</span>
            </span>
            <div className="analysis-score-track">
              <div className="analysis-score-fill" style={{ width: `${policy.score}%`, background: policyColor }} />
            </div>
          </div>
          <div className="analysis-rule-list">
            {policy.rules.map((rule) => (
              <div key={rule.id} className="analysis-rule-row">
                <span className={`analysis-rule-icon ${ruleIconClass[rule.status]}`}>
                  {ruleIcon[rule.status]}
                </span>
                <div className="analysis-rule-body">
                  <div className="analysis-rule-name">{rule.name}</div>
                  <div className="analysis-rule-detail">{rule.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2: AI Analysis (full width) ── */}
      <div className="card analysis-insight">
        <h2 className="section-title">AI Analysis</h2>
        <AnalysisText text={data.analysis} />
      </div>

      {/* ── Row 3: Optimization + Recent transactions ── */}
      <div className="analysis-grid analysis-grid--6040">

        <div className="card">
          <h2 className="section-title">
            Optimization Suggestions
            <span className="section-title-meta">${optimization.total_estimated_savings.toLocaleString()} potential savings</span>
          </h2>
          <div className="analysis-opt-list">
            {optimization.suggestions.map((s) => (
              <div key={s.id} className="analysis-opt-item">
                <div className={`analysis-opt-dot analysis-opt-dot--${s.priority}`} />
                <div className="analysis-opt-body">
                  <div className="analysis-opt-header">
                    <span className="analysis-opt-title">{s.title}</span>
                    {s.estimated_savings > 0 && (
                      <span className="analysis-opt-savings">${s.estimated_savings.toLocaleString()}</span>
                    )}
                  </div>
                  <p className="analysis-opt-desc">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="section-title">
            Recent Transactions
            <span className="section-title-meta">last {recent_transactions.length}</span>
          </h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Merchant</th>
                <th>MCC</th>
              </tr>
            </thead>
            <tbody>
              {recent_transactions.map((txn, i) => {
                const amt = parseFloat(String(txn.amount));
                const isCredit = amt < 0;
                return (
                  <tr key={i}>
                    <td>{formatDate(txn.txn_ts)}</td>
                    <td className={isCredit ? 'txn-credit' : 'txn-debit'}>
                      {isCredit ? `+$${Math.abs(amt).toFixed(2)}` : `$${amt.toFixed(2)}`}
                    </td>
                    <td style={{ color: '#64748b' }}>{txn.merchant_id}</td>
                    <td style={{ color: '#94a3b8', fontSize: 12 }}>{txn.mcc}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Row 4: All categories ── */}
      <div className="card">
        <h2 className="section-title">
          All Spending Categories
          <span className="section-title-meta">{graph.categories.length} categories</span>
        </h2>
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Transactions</th>
                <th>Share</th>
              </tr>
            </thead>
            <tbody>
              {graph.categories.map((cat) => (
                <tr key={cat.category}>
                  <td>{cat.category}</td>
                  <td>${cat.amount.toLocaleString()}</td>
                  <td>{cat.transaction_count.toLocaleString()}</td>
                  <td>
                    <span style={{ color: cat.percentage >= 5 ? '#3b82f6' : '#94a3b8' }}>
                      {cat.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
