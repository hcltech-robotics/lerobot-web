import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../pages/Layout';
import { lazy, Suspense } from 'react';
import Loader from '../components/Loader';

const Teleoperate = lazy(() => import('../pages/Teleoperate'));
const Calibration = lazy(() => import('../pages/Calibration'));
const Policies = lazy(() => import('../pages/Policies'));
const AITraining = lazy(() => import('../pages/AITraining'));
const Configuration = lazy(() => import('../pages/Configuration'));

export default function AppRouter() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/teleoperate" />} />
            <Route path="teleoperate" element={<Teleoperate />} />
            <Route path="calibration" element={<Calibration />} />
            <Route path="policies" element={<Policies />} />
            <Route path="ai-training" element={<AITraining />} />
            <Route path="configuration" element={<Configuration />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
