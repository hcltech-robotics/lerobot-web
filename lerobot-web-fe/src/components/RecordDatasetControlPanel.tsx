import { useEffect, useState } from 'react';
import type { DatasetMetaData } from '../models/recordDataset.model';
import { DatasetForm } from './DatasetForm';
import { RecordingSession } from './RecordingSession';
import { recordDataset } from '../services/recordDataset.service';
import { useRunningStore } from '../stores/running.store';
import { ToastType, useToastStore } from '../stores/toast.store';

import styles from './RecordDatasetControlPanel.module.css';

export function RecordDatasetControlPanel() {
  const [datasetMetaData, setDatasetMetaData] = useState<DatasetMetaData | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(false);
  const setRunning = useRunningStore((state) => state.setRunning);
  const addToast = useToastStore((state) => state.addToast);

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
      addToast({
        type: ToastType.Success,
        title: 'Success!',
        description: 'The recording of the new dataset has started successfully.',
      });
    } catch (error) {
      setError(true);
      addToast({
        type: ToastType.Error,
        title: 'Error',
        description: 'The recording of the new dataset could not start due to an error.',
      });
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    setDatasetMetaData(null);
    addToast({
      type: ToastType.Success,
      title: 'Success!',
      description: 'The new dataset was successfully stopped.',
    });
  };

  const handleFinish = () => {
    setIsRunning(false);
    setIsSuccess(true);
    addToast({
      type: ToastType.Success,
      title: 'Success!',
      description: 'The new dataset has been successfully recorded.',
    });
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
