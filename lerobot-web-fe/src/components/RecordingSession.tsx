import { useState } from 'react';
import { recordingState, type RecordingSessionProps, type RecordingStates } from '../models/recordDataset.model';
import { Countdown } from './Countdown';
import { AlertDialog } from './AlertDialog';
import { ControlButtons } from './ControlButtons';

import styles from './RecordingSession.module.css';

export function RecordingSession({ meta, onStop, onFinish }: RecordingSessionProps) {
  const [phase, setPhase] = useState<RecordingStates>(recordingState.EPISODE);
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);

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

  const handleAlertSubmit = () => {
    setOpen(false);
    onStop();
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
