import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../pages/Layout';
import { lazy, Suspense } from 'react';
import Loader from '../components/Loader';

const Teleoperate = lazy(() => import('../pages/Teleoperate'));
const Calibration = lazy(() => import('../pages/Calibration'));
const ModelPlayback = lazy(() => import('../pages/ModelPlayback'));
const RecordDataset = lazy(() => import('../pages/RecordDataset'));
const Configuration = lazy(() => import('../pages/Configuration'));

export default function AppRouter() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/configuration" />} />
            <Route path="teleoperate" element={<Teleoperate />} />
            <Route path="calibration" element={<Calibration />} />
            <Route path="model-playback" element={<ModelPlayback />} />
            <Route path="record-dataset" element={<RecordDataset />} />
            <Route path="configuration" element={<Configuration />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
