import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { logger } from './utils/logger';

export default function App(): React.ReactElement {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    logger.info('App initializing...');

    // Check backend connectivity
    const checkBackend = async (): Promise<void> => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/health`);
        if (response.ok) {
          logger.info('Backend connected');
          setIsReady(true);
        }
      } catch (err) {
        logger.error('Failed to connect to backend', err);
        // Still set ready for development
        setIsReady(true);
      }
    };

    checkBackend();
  }, []);

  if (!isReady) {
    return (
      <div className="loading-screen">
        <div className="spinner">Connecting...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<div>Welcome to AI Heat Map (Phase 2: Routes to be implemented)</div>} />
    </Routes>
  );
}
