import { useEffect, useState } from 'react';
import type { DatasetMetaData } from '../models/recordDataset.model';
import { DatasetForm } from './DatasetForm';
import { RecordingSession } from './RecordingSession';
import { recordDataset } from '../services/recordDataset.service';
import { useRunningStore } from '../stores/running.store';

import styles from './RecordDatasetControlPanel.module.css';

export function RecordDatasetControlPanel() {
  const [datasetMetaData, setDatasetMetaData] = useState<DatasetMetaData | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(false);
  const setRunning = useRunningStore((state) => state.setRunning);

  useEffect(() => {
    setRunning('recording-dataset', isRunning);
  }, [isRunning]);

  const handleStart = async (data: DatasetMetaData) => {
    setError(false);
    setDatasetMetaData(data);

    try {
      await recordDataset(data);
      setIsRunning(true);
      setIsSuccess(false);
    } catch (error) {
      setError(true);
    }
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
      {error && <p className={styles.errorMessage}>Error while recording "{datasetMetaData?.repoId}"</p>}
    </section>
  );
}
