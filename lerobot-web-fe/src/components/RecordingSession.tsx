import { useState } from 'react';
import { PauseIcon, PlusIcon, ReloadIcon, StopIcon } from '@radix-ui/react-icons';
import { Countdown } from './Countdown';
import { recordingState, type RecordingSessionProps, type RecordingStates } from '../models/recordDataset.model';

import styles from './RecordingSession.module.css';

export function RecordingSession({ meta, onStop, onFinish }: RecordingSessionProps) {
  const [phase, setPhase] = useState<RecordingStates>(recordingState.EPISODE);
  const [step, setStep] = useState(1);

  const handleEpisodeEnd = () => {
    if (step >= Number(meta.numEpisodes)) {
      onFinish();
    } else {
      setPhase(recordingState.RESET);
    }
  };

  const handleResetEnd = () => {
    setStep((prev) => prev + 1);
    setPhase(recordingState.EPISODE);
  };

  return (
    <div className={styles.sessionContainer}>
      <div className={styles.sessionHeader}>
        <p className={styles.selectedId}>
          Selected Id: <strong>{meta.repoId}</strong>
        </p>
        <p className={styles.episodeCounter}>
          Episode {step} / {meta.numEpisodes}
        </p>
      </div>

      <div className={styles.progressBarWrapper}>
        <progress value={step} max={meta.numEpisodes}></progress>
      </div>

      <div className={styles.statusSection}>
        {phase === recordingState.EPISODE && (
          <>
            <p className={styles.statusText}>Episode {step} is running…</p>
            <Countdown startFrom={Number(meta.episodeTime)} onCountdownEnd={handleEpisodeEnd} />
          </>
        )}

        {phase === recordingState.RESET && (
          <>
            <p className={styles.statusText}>Episode {step + 1} starts in…</p>
            <Countdown startFrom={Number(meta.resetTime)} onCountdownEnd={handleResetEnd} />
          </>
        )}
      </div>

      <div className={styles.sessionButtonsGroup}>
        <button className={`${styles.sessionButton}`} onClick={onStop}>
          <PauseIcon className={styles.icon} />
          Pause
        </button>
        <button className={`${styles.sessionButton}`} onClick={onStop}>
          <ReloadIcon className={styles.icon} />
          Retry episode
        </button>
        <button className={`${styles.sessionButton}`} onClick={onStop}>
          <PlusIcon className={styles.icon} />
          Add 5 extra sec
        </button>
        <button className={`${styles.sessionButton} ${styles.stop}`} onClick={onStop}>
          <StopIcon className={styles.icon} />
          Stop
        </button>
      </div>
    </div>
  );
}
