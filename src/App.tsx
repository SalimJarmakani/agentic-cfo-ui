import { BrowserRouter, Routes, Route } from 'react-router';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SpendingSummary from './pages/SpendingSummary';
import Optimization from './pages/Optimization';
import PolicyCompliance from './pages/PolicyCompliance';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="spending" element={<SpendingSummary />} />
          <Route path="optimization" element={<Optimization />} />
          <Route path="policy" element={<PolicyCompliance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
