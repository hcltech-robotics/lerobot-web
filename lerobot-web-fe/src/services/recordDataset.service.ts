import { useRobotStore } from '../stores/robot.store';
import { useConfigStore } from '../stores/config.store';
import { useCameraStore } from '../stores/camera.store';
import type { DatasetMetaData, RecordingResponse, RecordingSessionWsResponse } from '../models/recordDataset.model';
import { getFollowerBySide, getLeaderBySide } from './robot.service';
import { createWebSocket } from '../utils/createWebsocket';
import { apiFetch } from '../utils/apiFetch';
import { robotSideList } from '../models/robot.model';

export async function recordDataset(meta: DatasetMetaData): Promise<RecordingResponse> {
  const { apiUrl } = useConfigStore.getState();
  const { isBimanualMode, robots } = useRobotStore.getState();
  const { cameraList } = useCameraStore.getState();

  if (!apiUrl) {
    throw new Error('API URL not set. Please configure the system.');
  }

  if (isBimanualMode) {
    throw new Error('Bimanual mode is not supported for recording a new data set.');
  }

  if (!robots || robots.length === 0) {
    throw new Error('No connected robot found. Please connect and try again.');
  }

  const cameras = cameraList?.cameras.map((camera) => ({
    type: 'opencv',
    index_or_path: camera,
    width: 640,
    height: 480,
    fps: 30,
  }));

  const follower = getFollowerBySide(robots, robotSideList.LEFT);
  const leader = getLeaderBySide(robots, robotSideList.LEFT);

  return apiFetch<RecordingResponse>('record/start', {
    method: 'POST',
    body: JSON.stringify({
      follower_port: follower[0],
      leader_port: leader[0],
      repo_id: meta.repoId,
      num_episodes: meta.numEpisodes,
      episode_time_s: meta.episodeTime,
      reset_time_s: meta.resetTime,
      task_description: meta.singleTask,
      fps: 30,
      display_data: false,
      cameras,
    }),
    toast: { success: 'Recording started.' },
  });
}

export async function pauseRecording(): Promise<RecordingResponse> {
  return apiFetch<RecordingResponse>('record/stop', {
    method: 'POST',
    toast: { success: 'Recording paused.' },
  });
}

export async function retryRecording(): Promise<RecordingResponse> {
  return apiFetch<RecordingResponse>('record/rerecord', {
    method: 'POST',
    toast: { success: 'Retrying current episode.' },
  });
}

export async function stopRecording(): Promise<RecordingResponse> {
  return apiFetch<RecordingResponse>('record/exit', {
    method: 'POST',
    toast: { success: 'Recording stopped.' },
  });
}

export function useRecordingStatus(
  onMessage: (jointStateResponse: RecordingSessionWsResponse) => void,
  onOpen?: () => void,
  onClose?: () => void,
): WebSocket {
  const { apiUrl } = useConfigStore.getState();

  if (!apiUrl) {
    throw new Error('API URL not set. Please configure the system.');
  }

  const url = new URL('/record/ws', apiUrl);
  return createWebSocket(url, (event) => onMessage(JSON.parse(event.data)), onOpen, onClose);
}
