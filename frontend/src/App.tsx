import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { GlobePage } from './pages/GlobePage';

// The dashboard pulls in Recharts; load it only when that route is visited.
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);

function RouteFallback(): React.ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg)',
        color: 'var(--acc)',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 13,
      }}
    >
      Loading…
    </div>
  );
}

export default function App(): React.ReactElement {
  return (
    <Routes>
      <Route path="/" element={<GlobePage />} />
      <Route
        path="/dashboard"
        element={
          <Suspense fallback={<RouteFallback />}>
            <DashboardPage />
          </Suspense>
        }
      />
    </Routes>
  );
}
