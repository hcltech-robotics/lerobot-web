import { useEffect, useState } from 'react';
import { BaseSelector, type SelectOption } from './BaseSelector';

import styles from './Selector.module.css';

interface SelectorProps {
  options: string[] | SelectOption[];
  selected: string;
  label?: string;
  disabled?: boolean;
  onChange: (change: string) => void;
}

export function Selector({ options, selected, label = 'Select an option', disabled = false, onChange }: SelectorProps) {
  const [mappedOptions, setMappedOptions] = useState<SelectOption[]>([]);

  useEffect(() => {
    let mapped: SelectOption[];

    if (!options) {
      return;
    }

    if (typeof options[0] === 'string') {
      const robotOptions = options.map((value) => ({
        label: value,
        value: value,
      }));
      mapped = robotOptions as SelectOption[];
    } else {
      mapped = options as SelectOption[];
    }

    setMappedOptions(mapped);
  }, [options]);

  return (
    <>
      {mappedOptions.length > 0 ? (
        <div className={styles.selectWrapper}>
          <BaseSelector label={label} value={selected} disabled={disabled} options={mappedOptions} onChange={onChange} />
        </div>
      ) : (
        <p>There is no options</p>
      )}
    </>
  );
}
