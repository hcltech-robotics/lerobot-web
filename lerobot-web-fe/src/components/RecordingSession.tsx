import { useState } from 'react';
import { PauseIcon, PlusIcon, StopIcon } from '@radix-ui/react-icons';
import { Countdown } from './Countdown';
import type { DatasetMetaData } from '../models/recordDataset.model';

import styles from './RecordingSession.module.css';

export function RecordingSession({ meta, onStop, onFinish }: { meta: DatasetMetaData; onStop: () => void; onFinish: () => void }) {
  const [phase, setPhase] = useState<'episode' | 'reset'>('episode');
  const [step, setStep] = useState(1);

  const handleEpisodeEnd = () => {
    if (step >= Number(meta.numEpisodes)) {
      onFinish();
    } else {
      setPhase('reset');
    }
  };

  const handleResetEnd = () => {
    setStep((prev) => prev + 1);
    setPhase('episode');
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
        {phase === 'episode' && (
          <>
            <p className={styles.statusText}>Episode {step} is running…</p>
            <Countdown startFrom={Number(meta.episodeTime)} onCountdownEnd={handleEpisodeEnd} />
          </>
        )}

        {phase === 'reset' && (
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
          <PlusIcon className={styles.icon} />
          Add 5 episode
        </button>
        <button className={`${styles.sessionButton} ${styles.stop}`} onClick={onStop}>
          <StopIcon className={styles.icon} />
          Stop
        </button>
      </div>
    </div>
  );
}
