import { Routes, Route } from 'react-router-dom';
import { GlobePage } from './pages/GlobePage';
import { DashboardPage } from './pages/DashboardPage';

export default function App(): React.ReactElement {
  return (
    <Routes>
      <Route path="/" element={<GlobePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
    </Routes>
  );
}
