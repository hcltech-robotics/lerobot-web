export interface DatasetMetaData {
  repoId: string;
  numEpisodes: string | number;
  episodeTime: string | number;
  resetTime: string | number;
  singleTask: string;
}

export const initFormData: DatasetMetaData = {
  repoId: '',
  numEpisodes: '',
  episodeTime: '',
  resetTime: '',
  singleTask: '',
};

export interface RecordingSessionProps {
  meta: DatasetMetaData;
  onStop: () => void;
  onFinish: () => void;
}

export interface RecordingSessionWsResponse {
  current_episode: number;
  episode_start_time: number;
  episodes_left: number;
  in_reset: number;
  is_running: number;
  reset_time_s: number;
  time_left_s: number;
  total_episodes: number;
}
