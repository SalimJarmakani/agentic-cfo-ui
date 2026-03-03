import './Page.css';

const mockSuggestions = [
  {
    id: '1',
    title: 'Cancel unused subscriptions',
    description: 'Detected 3 subscriptions with no usage in the past 60 days.',
    estimatedSavings: 89,
    category: 'Subscriptions',
    priority: 'high' as const,
  },
  {
    id: '2',
    title: 'Switch to a lower utility plan',
    description: 'Usage patterns suggest a lower-tier plan would cover your needs.',
    estimatedSavings: 45,
    category: 'Utilities',
    priority: 'medium' as const,
  },
  {
    id: '3',
    title: 'Reduce dining frequency',
    description: 'Dining spend is 18% above peer average for this income bracket.',
    estimatedSavings: 120,
    category: 'Food & Dining',
    priority: 'medium' as const,
  },
  {
    id: '4',
    title: 'Consolidate transport costs',
    description: 'Consider a monthly transit pass instead of per-trip payments.',
    estimatedSavings: 60,
    category: 'Transport',
    priority: 'low' as const,
  },
];

const priorityClass = {
  high: 'badge badge--red',
  medium: 'badge badge--yellow',
  low: 'badge badge--blue',
};

export default function Optimization() {
  const totalSavings = mockSuggestions.reduce((sum, s) => sum + s.estimatedSavings, 0);

  return (
    <div className="page">
      <h1 className="page-title">Optimization</h1>
      <p className="page-sub">
        Agent-generated recommendations — estimated savings:{' '}
        <strong>${totalSavings}/mo</strong>
      </p>

      <div className="suggestion-list">
        {mockSuggestions.map((s) => (
          <div key={s.id} className="card suggestion-card">
            <div className="suggestion-header">
              <span className="suggestion-title">{s.title}</span>
              <span className={priorityClass[s.priority]}>{s.priority}</span>
            </div>
            <p className="suggestion-desc">{s.description}</p>
            <div className="suggestion-footer">
              <span className="suggestion-category">{s.category}</span>
              <span className="suggestion-savings">Save ${s.estimatedSavings}/mo</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
