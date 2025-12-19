import styles from './OnlineStatusButton.module.css';

interface OnlineStatusButtonProps {
  isLive: boolean;
  onClick: (isLive: boolean) => void;
}

export function OnlineStatusButton({ isLive, onClick }: OnlineStatusButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isLive}
      className={`${styles.statusButton} ${isLive ? styles.online : styles.offline}`}
      onClick={() => onClick(!isLive)}
    >
      {isLive ? 'Online' : 'Offline'}
    </button>
  );
}
