import { useState, useEffect } from 'react';
import { fetchOptimizationSuggestions } from '../services/api';
import type { OptimizationSuggestion } from '../types';
import './Page.css';

// PREVIOUS MOCK VERSION
// const mockSuggestions = [
//   {
//     id: '1',
//     title: 'Cancel unused subscriptions',
//     description: 'Detected 3 subscriptions with no usage in the past 60 days.',
//     estimatedSavings: 89,
//     category: 'Subscriptions',
//     priority: 'high' as const,
//   },
//   {
//     id: '2',
//     title: 'Switch to a lower utility plan',
//     description: 'Usage patterns suggest a lower-tier plan would cover your needs.',
//     estimatedSavings: 45,
//     category: 'Utilities',
//     priority: 'medium' as const,
//   },
//   {
//     id: '3',
//     title: 'Reduce dining frequency',
//     description: 'Dining spend is 18% above peer average for this income bracket.',
//     estimatedSavings: 120,
//     category: 'Food & Dining',
//     priority: 'medium' as const,
//   },
//   {
//     id: '4',
//     title: 'Consolidate transport costs',
//     description: 'Consider a monthly transit pass instead of per-trip payments.',
//     estimatedSavings: 60,
//     category: 'Transport',
//     priority: 'low' as const,
//   },
// ];
//
// export default function Optimization() {
//   const totalSavings = mockSuggestions.reduce((sum, s) => sum + s.estimatedSavings, 0);
//   return (
//     <div className="page">
//       <h1 className="page-title">Optimization</h1>
//       <p className="page-sub">Agent-generated recommendations — estimated savings: <strong>${totalSavings}/mo</strong></p>
//       <div className="suggestion-list">
//         {mockSuggestions.map((s) => (
//           <div key={s.id} className="card suggestion-card">
//             <div className="suggestion-header">
//               <span className="suggestion-title">{s.title}</span>
//               <span className={priorityClass[s.priority]}>{s.priority}</span>
//             </div>
//             <p className="suggestion-desc">{s.description}</p>
//             <div className="suggestion-footer">
//               <span className="suggestion-category">{s.category}</span>
//               <span className="suggestion-savings">Save ${s.estimatedSavings}/mo</span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

const priorityClass = {
  high: 'badge badge--red',
  medium: 'badge badge--yellow',
  low: 'badge badge--blue',
};

const USER_ID = 2; // hardcoded for now

export default function Optimization() {
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchOptimizationSuggestions(USER_ID)
      .then(setSuggestions)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalSavings = suggestions.reduce((sum, s) => sum + s.estimated_savings, 0);

  if (loading) return <div className="page"><p style={{ color: '#64748b', padding: '2rem' }}>Loading…</p></div>;
  if (error) return <div className="page"><p style={{ color: '#ef4444', padding: '2rem' }}>{error}</p></div>;

  return (
    <div className="page">
      <h1 className="page-title">Optimization</h1>
      <p className="page-sub">
        Agent-generated recommendations — estimated savings:{' '}
        <strong>${totalSavings.toFixed(2)}/mo</strong>
      </p>

      {suggestions.length === 0 ? (
        <div className="card"><p style={{ color: '#64748b' }}>No optimization suggestions found for this user.</p></div>
      ) : (
        <div className="suggestion-list">
          {suggestions.map((s) => (
            <div key={s.id} className="card suggestion-card">
              <div className="suggestion-header">
                <span className="suggestion-title">{s.title}</span>
                <span className={priorityClass[s.priority]}>{s.priority}</span>
              </div>
              <p className="suggestion-desc">{s.description}</p>
              <div className="suggestion-footer">
                <span className="suggestion-category">{s.category}</span>
                {s.estimated_savings > 0 && (
                  <span className="suggestion-savings">Save ${s.estimated_savings.toFixed(2)}/mo</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
