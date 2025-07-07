import styles from './Loader.module.css';

export default function Loader() {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}></div>
      <p>Loading...</p>
    </div>
  );
}
