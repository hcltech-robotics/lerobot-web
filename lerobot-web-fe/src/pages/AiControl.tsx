import { useEffect, useMemo, useState } from 'react';
import { StopIcon, PlayIcon } from '@radix-ui/react-icons';
import { robotLayout } from '../models/teleoperate.model';
import { MainScene } from '../components/MainScene';
import { Robot } from '../components/Robot';
import { robotRoleList, robotSideList, type RobotItem } from '../models/robot.model';
import { useRobotStore } from '../stores/robot.store';
import { CameraStream } from '../components/CameraStream';
import { Selector } from '../components/Selector';
import { fetchAIControl, getUserModels } from '../services/aiControl.service';
import { controlStatus, type ControlStatus } from '../models/general.model';
import { useAiControlStore } from '../stores/aiControl.store';
import { aiControlStatusList } from '../models/aiControl.model';
import { OnlineStatusButton } from '../components/OnlineStatusButton';
import { useApiKeyStore } from '../stores/apikey.store';

import styles from './AiControl.module.css';

export default function AiControl() {
  const robots = useRobotStore((store) => store.robots);
  const isBimanualMode = useRobotStore((store) => store.isBimanualMode);
  const setModels = useAiControlStore((store) => store.setModels);
  const apiKey = useApiKeyStore((store) => store.apiKey);
  const userId = useAiControlStore((state) => state.userId);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!apiKey || !userId) {
      setError('The userId and/or apiKey are missing. Please provide them on the calibration page.');
      return;
    }

    mapModels(apiKey, userId);
  }, [apiKey]);

  const mapModels = async (apiKey: string, userId: string) => {
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

  const fetchModel = async () => {
    if (!isBimanualMode) {
      const followerId = followers[0]?.id || '';
      const modelStatus = isRunning ? controlStatus.STOP : controlStatus.START;

      handleAIControl(selectedModel, followerId, modelStatus);
    }
  };

  const handleAIControl = async (selectedModel: string, followerId: string, modelStatus: ControlStatus) => {
    setLoading(true);
    const result = await fetchAIControl(selectedModel, followerId, modelStatus);

    if (result.status === aiControlStatusList.OK) {
      setIsRunning((prev) => !prev);
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  const followers = useMemo(() => {
    if (!robots) return [];

    const allFollowers = robots.filter((robot) => robot.role === robotRoleList.FOLLOWER);

    if (isBimanualMode) {
      const left = allFollowers.find((follower) => follower.side === robotSideList.LEFT);
      const right = allFollowers.find((follower) => follower.side === robotSideList.RIGHT);
      return [left, right].filter(Boolean) as RobotItem[];
    }

    const left = allFollowers.find((follower) => follower.side === robotSideList.LEFT);
    return left ? [left] : [];
  }, [robots, isBimanualMode]);

  return (
    <div className={styles.statusBox}>
      <h2 className={styles.title}>Select a pre-trained model</h2>
      <Selector
        label="Select a model"
        options={options}
        selected={selectedModel}
        onChange={(model: string) => setSelectedModel(model)}
        disabled={isRunning}
      />
      <button
        className={`${styles.controlButton} ${isRunning ? styles.stop : styles.start}`}
        disabled={!selectedModel || followers.length === 0}
        onClick={fetchModel}
      >
        {loading ? (
          <>
            <span className={styles.loader} />
            Loading
          </>
        ) : isRunning ? (
          <>
            <StopIcon className={styles.icon} />
            Stop
          </>
        ) : (
          <>
            <PlayIcon className={styles.icon} />
            Start
          </>
        )}
      </button>
      {error && <p className={styles.errorMessage}>Error: {error} </p>}
    </div>
  );
}
