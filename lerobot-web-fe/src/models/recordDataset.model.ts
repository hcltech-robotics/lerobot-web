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

export const recordingState = {
  RESET: 'reset',
  EPISODE: 'episode',
} as const;

export type RecordingStates = (typeof recordingState)[keyof typeof recordingState];
