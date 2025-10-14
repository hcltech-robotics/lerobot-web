import { useRobotStore } from '../stores/robot.store';
import { useConfigStore } from '../stores/config.store';
import { useCameraStore } from '../stores/camera.store';
import type { DatasetMetaData, RecordingResponse, RecordingSessionWsResponse } from '../models/recordDataset.model';
import { getFollowerBySide, getLeaderBySide } from './robot.service';
import { createWebSocket } from '../utils/createWebsocket';

export async function recordDataset(meta: DatasetMetaData): Promise<RecordingResponse> {
  const { apiUrl } = useConfigStore.getState();
  const { isBimanualMode, robots } = useRobotStore.getState();
  const { cameraList } = useCameraStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  if (isBimanualMode) {
    throw new Error('Bimanual mode is not supported for recording a new data set.');
  }

  if (!robots || robots.length === 0) {
    throw new Error('No connected robot found. Please connect and try again.');
  }

  const cameras = cameraList?.cameras.map((camera) => ({
    type: 'opencv',
    index_or_path: camera,
    with: 640,
    height: 480,
    fps: 30,
  }));

  const follower = getFollowerBySide(robots, 'left');
  const leader = getLeaderBySide(robots, 'left');

  try {
    const res = await fetch(`${apiUrl}/record/start`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        follower_port: follower[0],
        leader_port: leader[0],
        repo_id: meta.repoId,
        num_episodes: meta.numEpisodes,
        episode_time_s: meta.episodeTime,
        reset_time_s: meta.resetTime,
        fps: 30,
        display_data: false,
        cameras: cameras,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to playback model: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error in model playback:', error);
    throw error;
  }
}

export async function pauseRecording(): Promise<RecordingResponse> {
  const { apiUrl } = useConfigStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  try {
    const res = await fetch(`${apiUrl}/record/stop`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to pause recording dataset: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error in pause recording dataset:', error);
    throw error;
  }
}

export async function retryRecording(): Promise<RecordingResponse> {
  const { apiUrl } = useConfigStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  try {
    const res = await fetch(`${apiUrl}/record/rerecord`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to retry recording dataset: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error in retry recording dataset:', error);
    throw error;
  }
}

export async function stopRecording(): Promise<RecordingResponse> {
  const { apiUrl } = useConfigStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  try {
    const res = await fetch(`${apiUrl}/record/exit`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to stop recording dataset: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error in stop recording dataset:', error);
    throw error;
  }
}

export function useRecordingStatus(
  onMessage: (jointStateResponse: RecordingSessionWsResponse) => void,
  onOpen?: () => void,
  onClose?: () => void,
): WebSocket {
  const { apiUrl } = useConfigStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  const url = new URL('/record/ws', apiUrl);

  return createWebSocket(url, (event) => onMessage(JSON.parse(event.data)), onOpen, onClose);
}
