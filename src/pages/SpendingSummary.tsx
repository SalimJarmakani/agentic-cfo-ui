import './Page.css';

const mockCategories = [
  { category: 'Housing', amount: 1800, percentage: 36 },
  { category: 'Food & Dining', amount: 650, percentage: 13 },
  { category: 'Transport', amount: 420, percentage: 8.4 },
  { category: 'Subscriptions', amount: 280, percentage: 5.6 },
  { category: 'Utilities', amount: 220, percentage: 4.4 },
  { category: 'Other', amount: 1630, percentage: 32.6 },
];

const accent = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function SpendingSummary() {
  return (
    <div className="page">
      <h1 className="page-title">Spending Summary</h1>
      <p className="page-sub">Transaction breakdown by category</p>

      <div className="card">
        <h2 className="section-title">Category Breakdown</h2>
        <div className="bar-list">
          {mockCategories.map((cat, i) => (
            <div key={cat.category} className="bar-row">
              <span className="bar-label">{cat.category}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${cat.percentage}%`, background: accent[i] }}
                />
              </div>
              <span className="bar-amount">${cat.amount.toLocaleString()}</span>
              <span className="bar-pct">{cat.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Transaction Table</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {mockCategories.map((cat) => (
              <tr key={cat.category}>
                <td>{cat.category}</td>
                <td>${cat.amount.toLocaleString()}</td>
                <td>{cat.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
