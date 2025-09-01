import styles from './Loader.module.css';

type LoaderProps = {
  showText?: boolean;
};

export default function Loader({ showText = true }: LoaderProps) {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      {showText && <p>Loading...</p>}
    </div>
  );
}
