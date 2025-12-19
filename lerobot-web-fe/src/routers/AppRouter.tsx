import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../pages/Layout';
import { lazy, Suspense } from 'react';
import Loader from '../components/Loader';
import { BasicLayout } from '../pages/BasicLayout';

const Teleoperate = lazy(() => import('../pages/Teleoperate'));
const Calibration = lazy(() => import('../pages/Calibration'));
const Inference = lazy(() => import('../pages/Inference'));
const RecordDataset = lazy(() => import('../pages/RecordDataset'));
const Configuration = lazy(() => import('../pages/Configuration'));
const ChatControl = lazy(() => import('../pages/ChatControl'));

export default function AppRouter() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/configuration" />} />
            <Route path="teleoperate" element={<Teleoperate />} />
            <Route path="inference" element={<Inference />} />
            <Route path="record-dataset" element={<RecordDataset />} />
            <Route path="chat-control" element={<ChatControl />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
          <Route path="configuration" element={<BasicLayout />}>
            <Route index element={<Configuration />} />
          </Route>
          <Route path="calibration" element={<BasicLayout />}>
            <Route index element={<Calibration />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
