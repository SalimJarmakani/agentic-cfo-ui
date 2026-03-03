import { NavLink } from 'react-router';
import './Sidebar.css';

const nav = [
  { to: '/', label: 'Overview', icon: '▦' },
  { to: '/spending', label: 'Spending', icon: '◈' },
  { to: '/optimization', label: 'Optimization', icon: '◎' },
  { to: '/policy', label: 'Policy', icon: '◉' },
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
