import { Switch } from 'radix-ui';

import styles from './ToggleSwitch.module.css';

export interface ToggleSwitchParams {
  id?: string;
  title?: string;
  labels: string[];
  checked: boolean;
  disabled: boolean;
  onChange: ({ change, id }: ToggleSwitchChange) => void;
}

export interface ToggleSwitchChange {
  change: boolean;
  id?: string;
}

export default function ToggleSwitch({ id, title, labels, checked, disabled, onChange }: ToggleSwitchParams) {
  const onCheckedChange = (change: boolean) => {
    if (id) {
      onChange({ change, id });
    } else {
      onChange({ change });
    }
  };
  return (
    <div className={styles.SwitchWrapper}>
      {title && <label>{title}</label>}
      <div className={styles.SwitchContainer}>
        <label>{labels[0]}</label>
        <Switch.Root className={styles.Switch} checked={checked} disabled={disabled} onCheckedChange={onCheckedChange}>
          <Switch.Thumb className={styles.SwitchThumb} />
        </Switch.Root>
        <label>{labels[1]}</label>
      </div>
    </div>
  );
}
