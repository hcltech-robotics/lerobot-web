import { TabsWrapper } from '../components/TabsWrapper';
import ConfigurationBasicsForm from '../components/ConfigurationBasicsForm';
import ConfigurationCameraList from '../components/ConfigurationCameraList';

import styles from './Configuration.module.css';

export default function Configuration() {
  return (
    <section className={styles.configurationWrapper}>
      <h2 className={styles.title}>Configuration</h2>

      <TabsWrapper
        defaultValue="basics"
        items={[
          { label: 'Basics', value: 'basics', content: <ConfigurationBasicsForm /> },
          { label: 'Camera', value: 'camera', content: <ConfigurationCameraList /> },
        ]}
      />
    </section>
  );
}
