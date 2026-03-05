import { useState } from 'react';
import './Page.css';

const MOCK_USERS = [
  { id: 'USR-001', name: 'Alice Johnson', email: 'alice@company.com', department: 'Engineering', role: 'Admin' },
  { id: 'USR-002', name: 'Bob Martinez', email: 'bob@company.com', department: 'Finance', role: 'Analyst' },
  { id: 'USR-003', name: 'Carol Lee', email: 'carol@company.com', department: 'Operations', role: 'Viewer' },
  { id: 'USR-004', name: 'David Kim', email: 'david@company.com', department: 'HR', role: 'Viewer' },
  { id: 'USR-005', name: 'Eva Chen', email: 'eva@company.com', department: 'Finance', role: 'Analyst' },
  { id: 'USR-006', name: 'Frank Nguyen', email: 'frank@company.com', department: 'Engineering', role: 'Viewer' },
  { id: 'USR-007', name: 'Grace Park', email: 'grace@company.com', department: 'Legal', role: 'Analyst' },
  { id: 'USR-008', name: 'Henry Wu', email: 'henry@company.com', department: 'Finance', role: 'Admin' },
  { id: 'USR-009', name: 'Iris Patel', email: 'iris@company.com', department: 'HR', role: 'Viewer' },
  { id: 'USR-010', name: 'James Obi', email: 'james@company.com', department: 'Operations', role: 'Analyst' },
  { id: 'USR-011', name: 'Karen Flores', email: 'karen@company.com', department: 'Engineering', role: 'Viewer' },
  { id: 'USR-012', name: 'Leo Santos', email: 'leo@company.com', department: 'Finance', role: 'Viewer' },
];

const PAGE_SIZE = 5;

export default function Users() {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(MOCK_USERS.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const pageRows = MOCK_USERS.slice(start, start + PAGE_SIZE);

  return (
    <div className="page">
      <h1 className="page-title">Users</h1>
      <p className="page-sub">All registered users in the system.</p>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((user) => (
              <tr key={user.id}>
                <td style={{ fontFamily: 'monospace', color: '#6366f1' }}>{user.id}</td>
                <td>{user.name}</td>
                <td style={{ color: '#64748b' }}>{user.email}</td>
                <td>{user.department}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <span className="pagination-info">
            {start + 1}–{Math.min(start + PAGE_SIZE, MOCK_USERS.length)} of {MOCK_USERS.length} users
          </span>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
            >
              ‹ Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={'pagination-btn' + (p === page ? ' pagination-btn--active' : '')}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="pagination-btn"
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
            >
              Next ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
