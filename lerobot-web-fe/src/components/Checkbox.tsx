import * as BaseCheckbox from '@radix-ui/react-checkbox';

import styles from './Checkbox.module.css';

export function Checkbox({
  id,
  checked,
  label,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (id: string) => void;
  label?: string;
}) {
  return (
    <div>
      <BaseCheckbox.Root
        className={styles.checkboxWrapper}
        checked={checked}
        id={`checkbox_${id}`}
        onCheckedChange={() => onCheckedChange(id)}
      >
        <BaseCheckbox.Indicator forceMount>{checked ? 'L' : 'F'}</BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      {label && (
        <label className={styles.label} htmlFor={`checkbox_${id}`}>
          {label}
        </label>
      )}
    </div>
  );
}
