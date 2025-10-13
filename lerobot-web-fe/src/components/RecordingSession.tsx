import { useEffect, useRef, useState } from 'react';
import { type RecordingSessionProps, type RecordingSessionWsResponse } from '../models/recordDataset.model';
import { AlertDialog } from './AlertDialog';
import { ControlButtons } from './ControlButtons';
import { useRecordingStatus } from '../services/recordDataset.service';
import { useConfigStore } from '../stores/config.store';

import styles from './RecordingSession.module.css';

export function RecordingSession({ meta, onStop, onFinish }: RecordingSessionProps) {
  const [open, setOpen] = useState(false);
  const apiUrl = useConfigStore((state) => state.apiUrl);
  const websocket = useRef<WebSocket | null>(null);
  const [wsResponse, setWsResponse] = useState<RecordingSessionWsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  let statusText: string | null = null;
  let timeLeft: number | null = null;

  useEffect(() => {
    if (!apiUrl) return;
    setLoading(true);

    websocket.current = useRecordingStatus(setWsResponse, () => setLoading(false));

    return () => websocket.current?.close();
  }, [apiUrl]);

  useEffect(() => {
    if (!wsResponse) return;

    const isLastEpisode = wsResponse.current_episode === wsResponse.total_episodes;
    const isFinished = isLastEpisode && !wsResponse.in_reset && wsResponse.episode_start_time === 0 && wsResponse.time_left_s === 0;

    if (isFinished) {
      onFinish();
    }
  }, [wsResponse, onFinish]);

  const handleAlertSubmit = () => {
    setOpen(false);
    onStop();
  };

  const formatTime = (time: number) =>
    `${Math.floor(time / 60)
      .toString()
      .padStart(2, '0')}:${(time % 60).toString().padStart(2, '0')}`;

  if (wsResponse) {
    if (wsResponse.in_reset) {
      statusText = 'Reset time…';
      timeLeft = wsResponse.reset_time_s;
    } else if (wsResponse.episode_start_time > 0) {
      statusText = `Episode ${wsResponse.current_episode} start in…`;
      timeLeft = wsResponse.episode_start_time;
    } else {
      statusText = `Episode ${wsResponse.current_episode} is running…`;
      timeLeft = wsResponse.time_left_s;
    }
  }

  return (
    <div className={styles.sessionContainer}>
      <div className={styles.sessionHeader}>
        <p className={styles.selectedId}>
          Selected Id: <strong>{meta.repoId}</strong>
        </p>
        <p className={styles.episodeCounter}>
          Episode {wsResponse?.current_episode} / {wsResponse?.total_episodes}
        </p>
      </div>

      <div className={styles.progressBarWrapper}>
        <progress value={wsResponse?.current_episode} max={wsResponse?.total_episodes}></progress>
      </div>

      {statusText && (
        <div className={styles.statusSection}>
          <p className={styles.statusText}>{statusText}</p>
          {timeLeft !== null && <p>{formatTime(timeLeft)}</p>}
        </div>
      )}

      <div className={styles.controlButtonsWrapper}>
        <ControlButtons onPause={onStop} onRetry={onStop} onStop={() => setOpen(true)} />
      </div>

      <AlertDialog
        open={open}
        onOpenChange={setOpen}
        title="Are you sure?"
        description="This action cannot be undone. This will permanently stop recording and any episodes recorded so far will be lost."
        cancelText="Cancel"
        actionText="Yes, stop recording"
        onAction={handleAlertSubmit}
      />
    </div>
  );
}
