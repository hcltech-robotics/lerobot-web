import { RecordDatasetControlPanel } from '../components/RecordDatasetControlPanel';

import styles from './RecordDataset.module.css';

export default function RecordDataset() {
  return (
    <div className={styles.statusBox}>
      <h2 className={styles.title}>Record a new dataset</h2>
      <RecordDatasetControlPanel />
    </div>
  );
}
