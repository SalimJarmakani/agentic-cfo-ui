import { useState, useEffect } from 'react';
import { fetchSpendingSummary } from '../services/api';
import type { SpendingSummary } from '../types';
import './Page.css';

// PREVIOUS MOCK VERSION
// const mockCategories = [
//   { category: 'Housing', amount: 1800, percentage: 36 },
//   { category: 'Food & Dining', amount: 650, percentage: 13 },
//   { category: 'Transport', amount: 420, percentage: 8.4 },
//   { category: 'Subscriptions', amount: 280, percentage: 5.6 },
//   { category: 'Utilities', amount: 220, percentage: 4.4 },
//   { category: 'Other', amount: 1630, percentage: 32.6 },
// ];
//
// export default function SpendingSummary() {
//   return (
//     <div className="page">
//       <h1 className="page-title">Spending Summary</h1>
//       <p className="page-sub">Transaction breakdown by category</p>
//       <div className="card">
//         <h2 className="section-title">Category Breakdown</h2>
//         <div className="bar-list">
//           {mockCategories.map((cat, i) => (
//             <div key={cat.category} className="bar-row">
//               <span className="bar-label">{cat.category}</span>
//               <div className="bar-track">
//                 <div className="bar-fill" style={{ width: `${cat.percentage}%`, background: accent[i] }} />
//               </div>
//               <span className="bar-amount">${cat.amount.toLocaleString()}</span>
//               <span className="bar-pct">{cat.percentage}%</span>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div className="card">
//         <h2 className="section-title">Transaction Table</h2>
//         <table className="data-table">
//           <thead><tr><th>Category</th><th>Amount</th><th>Share</th></tr></thead>
//           <tbody>
//             {mockCategories.map((cat) => (
//               <tr key={cat.category}>
//                 <td>{cat.category}</td>
//                 <td>${cat.amount.toLocaleString()}</td>
//                 <td>{cat.percentage}%</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

const accent = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

const USER_ID = 2; // hardcoded for noww

export default function SpendingSummary() {
  const [data, setData] = useState<SpendingSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchSpendingSummary(USER_ID)
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page"><p style={{ color: '#64748b', padding: '2rem' }}>Loading…</p></div>;
  if (error) return <div className="page"><p style={{ color: '#ef4444', padding: '2rem' }}>{error}</p></div>;
  if (!data) return null;

  return (
    <div className="page">
      <h1 className="page-title">Spending Summary</h1>
      <p className="page-sub">
        Transaction breakdown by category — total: <strong>${data.total_spend.toLocaleString()}</strong>
        {' · '}{data.recurring_payments} recurring · {data.subscriptions} subscriptions
      </p>

      <div className="card">
        <h2 className="section-title">Category Breakdown</h2>
        <div className="bar-list">
          {data.categories.map((cat, i) => (
            <div key={cat.category} className="bar-row">
              <span className="bar-label">{cat.category}</span>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{ width: `${cat.percentage}%`, background: accent[i % accent.length] }}
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
              <th>Transactions</th>
              <th>Share</th>
            </tr>
          </thead>
          <tbody>
            {data.categories.map((cat) => (
              <tr key={cat.category}>
                <td>{cat.category}</td>
                <td>${cat.amount.toLocaleString()}</td>
                <td>{cat.transaction_count}</td>
                <td>{cat.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
