import { useState } from 'react';
import { useConfigStore } from '../stores/config.store';
import { isValidUrl } from '../services/configuration.service';
import * as Form from '@radix-ui/react-form';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';

import styles from './ConfigurationBasicsForm.module.css';

export default function ConfigurationBasicsForm() {
  const setApiUrl = useConfigStore((state) => state.setApiUrl);
  const apiUrl = useConfigStore((state) => state.apiUrl);
  const setToken = useConfigStore((state) => state.setToken);
  const token = useConfigStore((state) => state.token);

  const [url, setUrl] = useState(apiUrl || '');
  const [localToken, setLocalToken] = useState(token || '');
  const [showPassword, setShowPassword] = useState(false);
  const [urlTouched, setUrlTouched] = useState(false);

  const isUrlValid = isValidUrl(url);
  const isFormValid = isUrlValid;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;

    setApiUrl(url.trim());
    setToken(localToken);
  };

  return (
    <section>
      <Form.Root onSubmit={handleSubmit}>
        <Form.Field className={styles.field} name="url">
          <div className={styles.messageContainer}>
            <Form.Label className={styles.label}>Backend Url</Form.Label>
          </div>

          <Form.Control
            className={`${styles.input} ${urlTouched && !isUrlValid ? styles.InputError : ''}`}
            type="url"
            required
            name="url"
            value={url || ''}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => setUrlTouched(true)}
          />
          {urlTouched && !isUrlValid && <div className={styles.errorMessage}>Please provide a valid URL.</div>}
        </Form.Field>

        <Form.Field className={styles.field} name="token">
          <div className={styles.messageContainer}>
            <Form.Label className={styles.label}>Hugging Face Token</Form.Label>
          </div>
          <div className={styles.tokenWrapper}>
            <Form.Control
              className={`${styles.input} ${styles.tokenInput}`}
              type={showPassword ? 'text' : 'password'}
              name="token"
              value={localToken}
              onChange={(e) => setLocalToken(e.target.value)}
            />
            <button type="button" className={styles.tokenIconButton} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
            </button>
          </div>
        </Form.Field>

        <Form.Submit className={styles.submitButton} disabled={!isFormValid}>
          Save
        </Form.Submit>
      </Form.Root>
    </section>
  );
}
