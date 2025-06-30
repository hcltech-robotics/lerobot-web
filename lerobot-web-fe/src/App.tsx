import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { lazy, Suspense } from 'react';
import LoadingScreen from './components/LoadingScreen';

const Teleoperate = lazy(() => import('./components/Teleoperate'));
const Calibration = lazy(() => import('./components/Calibration'));
const Policies = lazy(() => import('./components/Policies'));
const AITraining = lazy(() => import('./components/AITraining'));

export default function AppRouter() {
  return (
    <Router>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/teleoperate" />} />
            <Route path="teleoperate" element={<Teleoperate />} />
            <Route path="calibration" element={<Calibration />} />
            <Route path="policies" element={<Policies />} />
            <Route path="ai-training" element={<AITraining />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
