import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import styles from './Selector.module.css';

type SelectOption = {
  label: string;
  value: string;
};

interface SelectorProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function RobotIdSelector({ label, value, options, onChange, disabled = false }: SelectorProps) {
  return (
    <>
      <label className={styles.selectLabel}>{label}</label>
      <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
        <Select.Trigger className={styles.selectTrigger} aria-label="Robot ID">
          <Select.Value />
          <Select.Icon>
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className={styles.selectContent} position="popper">
            <Select.Viewport>
              {options.map((option) => (
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
