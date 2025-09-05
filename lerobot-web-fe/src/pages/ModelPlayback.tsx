import { useEffect, useMemo, useState } from 'react';
import { StopIcon } from '@radix-ui/react-icons';
import { PlayIcon } from 'lucide-react';
import { robotLayout } from '../models/teleoperate.model';
import { MainScene } from '../components/MainScene';
import { Robot } from '../components/Robot';
import { robotRoleList, robotSideList, type RobotItem } from '../models/robot.model';
import { useRobotStore } from '../stores/robot.store';
import { CameraStream } from '../components/CameraStream';
import { Selector } from '../components/Selector';
import { fetchAIControl, getUserModels } from '../services/modelPlayback.service';
import { controlStatus, type ControlStatus } from '../models/general.model';
import { useModelPlaybackStore } from '../stores/modelPlayback.store';
import { aiControlStatusList } from '../models/modelPlayback.model';
import { OnlineStatusButton } from '../components/OnlineStatusButton';
import { useApiKeyStore } from '../stores/apikey.store';

import styles from './ModelPlayback.module.css';

export default function Policies() {
  const robots = useRobotStore((store) => store.robots);
  const isBimanualMode = useRobotStore((store) => store.isBimanualMode);
  const setModels = useModelPlaybackStore((store) => store.setModels);
  const apiKey = useApiKeyStore((store) => store.apiKey);
  const userId = useModelPlaybackStore((state) => state.userId);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
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
    try {
      const response = await getUserModels(apiKey, userId);
      const mappedModels = response.models.map((model) => model.modelId);

      setModels(response.models);
      setOptions(mappedModels);
    } catch (error) {
      setError('An error occurred while querying user models.');
    }
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

  const renderRobots = followers.map((follower) => {
    const layout = isBimanualMode ? robotLayout[follower.side] : robotLayout.single;

    return <Robot key={follower.id} isLive={isLive} position={layout.position} rotation={layout.rotation} robotLabel={follower.id} />;
  });

  return (
    <div className={styles.contentArea}>
      <div className={styles.control}>
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
        <div className={styles.sceneContainer}>
          <OnlineStatusButton isLive={isLive} onClick={setIsLive} />
          <div className={styles.mainScene}>
            <MainScene>{renderRobots}</MainScene>
          </div>
        </div>
      </div>
      <div className={styles.cameraContainer}>
        <CameraStream />
      </div>
    </div>
  );
}
