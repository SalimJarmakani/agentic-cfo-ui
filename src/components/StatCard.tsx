import './StatCard.css';

interface Props {
  label: string;
  value: string;
  sub?: string;
  accent?: 'blue' | 'green' | 'yellow' | 'red';
}

export default function StatCard({ label, value, sub, accent = 'blue' }: Props) {
  return (
    <div className={`stat-card stat-card--${accent}`}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}
