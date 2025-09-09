import { useState } from 'react';
import type { DatasetMetaData } from '../models/recordDataset.model';
import { DatasetForm } from './DatasetForm';
import { RecordingSession } from './RecordingSession';

import styles from './RecordDatasetControlPanel.module.css';

export function RecordDatasetControlPanel() {
  const [datasetMetaData, setDatasetMetaData] = useState<DatasetMetaData | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleStart = (data: DatasetMetaData) => {
    setDatasetMetaData(data);
    setIsRunning(true);
    setIsSuccess(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    setDatasetMetaData(null);
  };

  const handleFinish = () => {
    setIsRunning(false);
    setIsSuccess(true);
  };

  return (
    <section>
      {!isRunning && <DatasetForm onSubmit={handleStart} />}
      {isRunning && datasetMetaData && <RecordingSession meta={datasetMetaData} onStop={handleStop} onFinish={handleFinish} />}
      {isSuccess && <p className={styles.successMessage}>Successfully recorded "{datasetMetaData?.repoId}"</p>}
    </section>
  );
}
