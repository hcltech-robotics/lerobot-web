import { useEffect, useState } from 'react';

import styles from './Countdown.module.css';

interface CountdownProps {
  startFrom: number;
  onCountdownEnd?: () => void;
  variant?: 'number' | 'timer';
}

export function Countdown({ startFrom, onCountdownEnd, variant = 'timer' }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(startFrom);

  useEffect(() => {
    if (timeLeft <= 0) {
      onCountdownEnd?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onCountdownEnd]);

  if (variant === 'timer') {
    const minutes = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (timeLeft % 60).toString().padStart(2, '0');

    return (
      <p className={styles.countdown}>
        {minutes}:{seconds}
      </p>
    );
  }

  return <h1 className={styles.countdownNumber}>{timeLeft}</h1>;
}
