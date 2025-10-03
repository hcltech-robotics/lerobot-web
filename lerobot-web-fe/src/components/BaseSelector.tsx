import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon } from '@radix-ui/react-icons';

import styles from './BaseSelector.module.css';

export type SelectOption = {
  label: string;
  value: string;
};

interface BaseSelectorProps {
  label: string;
  value: string;
  options: SelectOption[] | null;
  onChange: (value: string) => void;
  disabled?: boolean;
}
export function BaseSelector({ label, value, options, onChange, disabled = false }: BaseSelectorProps) {
  return (
    <>
      <label className={styles.selectLabel}>{label}</label>
      <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger className={styles.selectTrigger}>
          <Select.Value />
          <Select.Icon>
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className={styles.selectContent} position="popper">
            <Select.Viewport className={styles.viewPort}>
              {options &&
                options.map((option) => (
                  <Select.Item key={option.value} value={option.value} className={styles.selectItem}>
                    <Select.ItemText>{option.label}</Select.ItemText>
                  </Select.Item>
                ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </>
  );
}
