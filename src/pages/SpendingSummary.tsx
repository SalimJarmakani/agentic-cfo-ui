import { useEffect, useState } from 'react';
import {
  fetchSpendingSummary,
  fetchUserSpendingSummary,
  fetchUsers,
  type User,
} from '../services/api';
import type { SpendingSummary, UserSpendingSummary } from '../types';
import './Page.css';

const accent = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#7c3aed', '#0891b2'];

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SpendingSummary() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [summary, setSummary] = useState<UserSpendingSummary | null>(null);
  const [graph, setGraph] = useState<SpendingSummary | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSpending, setLoadingSpending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoadingUsers(true);
    setError(null);

    fetchUsers(1, 100)
      .then((response) => {
        if (cancelled) return;
        setUsers(response.items);
        setSelectedUserId((current) => current ?? response.items[0]?.user_id ?? null);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setSummary(null);
      setGraph(null);
      return;
    }

    let cancelled = false;

    setLoadingSpending(true);
    setError(null);

    Promise.all([
      fetchUserSpendingSummary(selectedUserId),
      fetchSpendingSummary(selectedUserId),
    ])
      .then(([summaryResponse, graphResponse]) => {
        if (cancelled) return;
        setSummary(summaryResponse);
        setGraph(graphResponse);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setSummary(null);
          setGraph(null);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingSpending(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedUserId]);

  if (loadingUsers) {
    return <div className="page"><p style={{ color: '#64748b', padding: '2rem' }}>Loading users...</p></div>;
  }

  if (error && !summary && !graph) {
    return <div className="page"><p style={{ color: '#ef4444', padding: '2rem' }}>{error}</p></div>;
  }

  return (
    <div className="page">
      <h1 className="page-title">Spending Summary</h1>
      <p className="page-sub">Choose a user to inspect their spending totals, category mix, and transaction window.</p>

      <div className="card">
        <div className="page-toolbar">
          <div>
            <h2 className="section-title" style={{ marginBottom: 6 }}>Select User</h2>
            <p className="page-sub" style={{ marginBottom: 0 }}>
              Detailed spending output is loaded for one user at a time.
            </p>
          </div>
          <label className="page-select-wrap">
            <span className="page-select-label">User</span>
            <select
              className="page-select"
              value={selectedUserId ?? ''}
              onChange={(event) => setSelectedUserId(Number(event.target.value))}
              disabled={users.length === 0 || loadingSpending}
            >
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  User {user.user_id}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {loadingSpending ? (
        <div className="card">
          <p style={{ color: '#64748b', margin: 0 }}>Loading spending details...</p>
        </div>
      ) : summary && graph ? (
        <>
          <div className="stat-grid">
            <div className="card" style={{ marginBottom: 0 }}>
              <span className="compliance-score-label">Total Spend</span>
              <div className="compliance-score-value" style={{ color: '#0f172a' }}>
                {formatCurrency(summary.total_spend)}
              </div>
            </div>
            <div className="card" style={{ marginBottom: 0 }}>
              <span className="compliance-score-label">Transactions</span>
              <div className="compliance-score-value" style={{ color: '#0f172a' }}>
                {summary.txn_count.toLocaleString()}
              </div>
            </div>
            <div className="card" style={{ marginBottom: 0 }}>
              <span className="compliance-score-label">Average Ticket</span>
              <div className="compliance-score-value" style={{ color: '#0f172a' }}>
                {formatCurrency(summary.avg_ticket)}
              </div>
            </div>
            <div className="card" style={{ marginBottom: 0 }}>
              <span className="compliance-score-label">Transaction Window</span>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', lineHeight: 1.5 }}>
                {formatDate(summary.first_txn_ts)}
                <br />
                <span style={{ color: '#64748b', fontWeight: 500 }}>to {formatDate(summary.last_txn_ts)}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">Category Breakdown</h2>
            <p className="page-sub" style={{ marginBottom: 16 }}>
              User {summary.user_id} total: <strong>{formatCurrency(graph.total_spend)}</strong>
              {' · '}{graph.recurring_payments} recurring
              {' · '}{graph.subscriptions} subscriptions
            </p>
            <div className="bar-list">
              {graph.categories.map((cat, i) => (
                <div key={cat.category} className="bar-row">
                  <span className="bar-label">{cat.category}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${cat.percentage}%`, background: accent[i % accent.length] }}
                    />
                  </div>
                  <span className="bar-amount">{formatCurrency(cat.amount)}</span>
                  <span className="bar-pct">{cat.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="section-title">Spending Table</h2>
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
                    <td>{formatCurrency(cat.amount)}</td>
                    <td>{cat.transaction_count.toLocaleString()}</td>
                    <td>{cat.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="card">
          <p style={{ color: '#64748b', margin: 0 }}>No spending data available for the selected user.</p>
        </div>
      )}
    </div>
  );
}
