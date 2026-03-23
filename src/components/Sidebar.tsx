import { NavLink } from 'react-router';
import './Sidebar.css';

const nav = [
  { to: '/', label: 'Overview', icon: 'O' },
  { to: '/spending', label: 'Spending', icon: 'S' },
  { to: '/optimization', label: 'Optimization', icon: 'P' },
  { to: '/policy', label: 'Policy', icon: 'C' },
  { to: '/metrics', label: 'Metrics', icon: 'M' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">CFO</span>
        <span className="sidebar-title">Agentic CFO</span>
      </div>
      <nav className="sidebar-nav">
        {nav.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              'sidebar-link' + (isActive ? ' sidebar-link--active' : '')
            }
          >
            <span className="sidebar-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
