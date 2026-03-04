import { NavLink } from 'react-router';
import './Navbar.css';

const nav = [
  { to: '/', label: 'Overview' },
  { to: '/spending', label: 'Spending' },
  { to: '/optimization', label: 'Optimization' },
  { to: '/policy', label: 'Policy' },
];

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">CFO</span>
        <span className="navbar-title">Agentic CFO</span>
      </div>
      <nav className="navbar-nav">
        {nav.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              'navbar-link' + (isActive ? ' navbar-link--active' : '')
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
