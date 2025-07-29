import { useState } from 'react';
import * as Form from '@radix-ui/react-form';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useStatusStore } from '../stores/status.store';
import { isValidUrl } from '../services/configuration.service';

import styles from './Configuration.module.css';

export default function Configuration() {
  const setApiUrl = useStatusStore((state) => state.setApiUrl);
  const apiUrl = useStatusStore((state) => state.apiUrl);
  const setToken = useStatusStore((state) => state.setToken);
  const token = useStatusStore((state) => state.token);

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
    <section className={styles.ConfigurationWrapper}>
      <h2 className={styles.Title}>Configuration</h2>
      <Form.Root onSubmit={handleSubmit}>
        <Form.Field className={styles.Field} name="url">
          <div className={styles.MessageContainer}>
            <Form.Label className={styles.Label}>Backend Url</Form.Label>
          </div>

          <Form.Control
            className={`${styles.Input} ${urlTouched && !isUrlValid ? styles.InputError : ''}`}
            type="url"
            required
            name="url"
            value={url || ''}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => setUrlTouched(true)}
          />
          {urlTouched && !isUrlValid && <div className={styles.ErrorMessage}>Please provide a valid URL.</div>}
        </Form.Field>

        <Form.Field className={styles.Field} name="token">
          <div className={styles.MessageContainer}>
            <Form.Label className={styles.Label}>Hugging Face Token</Form.Label>
          </div>
          <div className={styles.TokenWrapper}>
            <Form.Control
              className={`${styles.Input} ${styles.TokenInput}`}
              type={showPassword ? 'text' : 'password'}
              name="token"
              value={localToken}
              onChange={(e) => setLocalToken(e.target.value)}
            />
            <button type="button" className={styles.TokenIconButton} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
            </button>
          </div>
        </Form.Field>

        <Form.Submit className={styles.SubmitButton} disabled={!isFormValid}>
          Save
        </Form.Submit>
      </Form.Root>
    </section>
  );
}
