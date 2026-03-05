import { useState, useEffect } from 'react';
import { fetchUsers, type PaginatedUsersResponse } from '../services/api';
import './Page.css';

const PAGE_SIZE = 25;

export default function Users() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedUsersResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchUsers(page, PAGE_SIZE)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;
  const start = (page - 1) * PAGE_SIZE;

  return (
    <div className="page">
      <h1 className="page-title">Users</h1>
      <p className="page-sub">All registered users in the system.</p>

      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Credit Score</th>
              <th>Yearly Income</th>
              <th>Total Debt</th>
              <th>Cards</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Loading…
                </td>
              </tr>
            ) : (
              (data?.items ?? []).map((user) => (
                <tr key={user.user_id}>
                  <td style={{ fontFamily: 'monospace', color: '#6366f1' }}>{user.user_id}</td>
                  <td>{user.current_age}</td>
                  <td>{user.gender}</td>
                  <td>{user.credit_score}</td>
                  <td>${user.yearly_income.toLocaleString()}</td>
                  <td>${user.total_debt.toLocaleString()}</td>
                  <td>{user.num_credit_cards}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">
            {data
              ? `${start + 1}–${Math.min(start + PAGE_SIZE, data.total)} of ${data.total.toLocaleString()} users`
              : '—'}
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1 || loading}
            >
              ‹ Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const start = Math.max(1, page - 2);
              return start + i;
            })
              .filter((p) => p <= totalPages)
              .map((p) => (
                <button
                  key={p}
                  className={'pagination-btn' + (p === page ? ' pagination-btn--active' : '')}
                  onClick={() => setPage(p)}
                  disabled={loading}
                >
                  {p}
                </button>
              ))}
            <button
              className="pagination-btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages || loading}
            >
              Next ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
