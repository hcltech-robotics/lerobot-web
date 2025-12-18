import { useEffect, useMemo, useState } from 'react';
import { StopIcon } from '@radix-ui/react-icons';
import { robotRoleList, robotSideList, type RobotItem } from '../models/robot.model';
import { useRobotStore } from '../stores/robot.store';
import { getUserModels, startInference, stopInference } from '../services/inference.service';
import { useAiControlStore } from '../stores/aiControl.store';
import { aiControlStatusList, type InferenceMetaData, type InferencePayload } from '../models/aiControl.model';
import { useApiKeyStore } from '../stores/apikey.store';
import { useRunningStore } from '../stores/running.store';
import { InferenceForm } from '../components/InferenceForm';
import Loader from '../components/Loader';

import styles from './Inference.module.css';

export default function Inference() {
  const robots = useRobotStore((store) => store.robots);
  const isBimanualMode = useRobotStore((store) => store.isBimanualMode);
  const robotType = useRobotStore((store) => store.robotType);
  const setModels = useAiControlStore((store) => store.setModels);
  const apiKey = useApiKeyStore((store) => store.apiKey);
  const userId = useAiControlStore((state) => state.userId);
  const setRunning = useRunningStore((state) => state.setRunning);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [inferenceMetaData, setInferenceMetaData] = useState<InferencePayload>();

  const followers = useMemo(() => {
    if (!robots) {
      return [];
    }

    const allFollowers = robots.filter((robot) => robot.role === robotRoleList.FOLLOWER);

    if (isBimanualMode) {
      const left = allFollowers.find((follower) => follower.side === robotSideList.LEFT);
      const right = allFollowers.find((follower) => follower.side === robotSideList.RIGHT);
      return [left, right].filter(Boolean) as RobotItem[];
    }

    const left = allFollowers.find((follower) => follower.side === robotSideList.LEFT);
    return left ? [left] : [];
  }, [robots, isBimanualMode]);

  useEffect(() => {
    setRunning('inference', isRunning);
  }, [isRunning]);

  useEffect(() => {
    if (!apiKey || !userId) {
      setError('Failed to get remote models. The userId and/or apiKey are missing. Please provide them on the configuration page.');
      return;
    }

    getRemoteModels(apiKey, userId);
  }, [apiKey]);

  const getRemoteModels = async (apiKey: string, userId: string) => {
    setLoading(true);
    try {
      const response = await getUserModels(apiKey, userId);
      const mappedModels = response.models.map((model) => model.modelId);

      setModels(response.models);
      setOptions(mappedModels);
    } catch (error) {
      setError('An error occurred while querying user models.');
    }
    setLoading(false);
  };

  const handleInferenceSubmit = (data: InferenceMetaData) => {
    if (!isBimanualMode && followers.length !== 0) {
      const followerId = followers[0]?.id || '';

      handleInferenceStart({ ...data, followerId, robotType });
    }
  };

  const handleInferenceStart = async (payload: InferencePayload) => {
    setLoading(true);
    const result = await startInference(payload);

    if (result.status === aiControlStatusList.OK) {
      setInferenceMetaData(payload);
      setIsRunning((prev) => !prev);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const handleInferenceStop = async () => {
    if (inferenceMetaData) {
      setLoading(true);
      try {
        await stopInference(inferenceMetaData);
        setIsRunning(false);
      } catch (error) {}
      setLoading(false);
    }
  };

  return (
    <div className={styles.statusBox}>
      <h2 className={styles.title}>Run Inference</h2>
      <InferenceForm remoteModels={options} isRunning={isRunning} onSubmit={handleInferenceSubmit} />

      {loading && <Loader />}
      {isRunning && (
        <button
          className={`${styles.controlButton} ${isRunning && styles.stop}`}
          disabled={followers.length === 0}
          onClick={handleInferenceStop}
        >
          <StopIcon className={styles.icon} />
          Stop
        </button>
      )}
      {error && <p className={styles.errorMessage}>Error: {error} </p>}
    </div>
  );
}
