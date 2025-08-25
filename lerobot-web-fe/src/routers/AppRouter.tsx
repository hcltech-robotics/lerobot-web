import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../pages/Layout';
import { lazy, Suspense } from 'react';
import Loader from '../components/Loader';

const Teleoperate = lazy(() => import('../pages/Teleoperate'));
const Calibration = lazy(() => import('../pages/Calibration'));
const ModelPlayback = lazy(() => import('../pages/ModelPlayback'));
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
            <Route path="model-playback" element={<ModelPlayback />} />
            <Route path="ai-training" element={<AITraining />} />
            <Route path="configuration" element={<Configuration />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
