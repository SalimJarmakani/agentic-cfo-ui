import { Outlet, useLocation } from 'react-router';
import Navbar from './Navbar';
import './Layout.css';

export default function Layout() {
  const location = useLocation();
  return (
    <div className="layout">
      <Navbar />
      <main className="layout-main">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
