import { useState } from 'react';
import { useConfigStore } from '../stores/config.store';
import { isValidUrl } from '../services/configuration.service';
import * as Form from '@radix-ui/react-form';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { useAiControlStore } from '../stores/aiControl.store';
import { useApiKeyStore } from '../stores/apikey.store';

import styles from './ConfigurationBasicsForm.module.css';

export default function ConfigurationBasicsForm() {
  const setApiUrl = useConfigStore((state) => state.setApiUrl);
  const apiUrl = useConfigStore((state) => state.apiUrl);
  const setApiKey = useApiKeyStore((store) => store.setApiKey);
  const apiKey = useApiKeyStore((store) => store.apiKey);
  const setUserId = useAiControlStore((state) => state.setUserId);
  const userId = useAiControlStore((state) => state.userId);

  const [url, setUrl] = useState(apiUrl || '');
  const [localApiKey, setLocalApiKey] = useState<string>(apiKey || '');
  const [localUserId, setLocalUserId] = useState<string>(userId || '');
  const [showPassword, setShowPassword] = useState(false);
  const [urlTouched, setUrlTouched] = useState(false);

  const isUrlValid = isValidUrl(url);
  const isFormValid = isUrlValid;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;

    setApiUrl(url.trim());
    setApiKey(localApiKey);
    setUserId(localUserId);
  };

  return (
    <section>
      <Form.Root onSubmit={handleSubmit}>
        <Form.Field className={styles.field} name="url">
          <div className={styles.messageContainer}>
            <Form.Label className={styles.label}>Backend Url</Form.Label>
          </div>

          <Form.Control
            className={`${styles.input} ${urlTouched && !isUrlValid ? styles.inputError : ''}`}
            type="url"
            required
            name="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => setUrlTouched(true)}
          />
          {urlTouched && !isUrlValid && <div className={styles.errorMessage}>Please provide a valid URL.</div>}
        </Form.Field>

        <Form.Field className={styles.field} name="hf_api_key">
          <div className={styles.messageContainer}>
            <Form.Label className={styles.label}>Hugging Face Api Key</Form.Label>
          </div>
          <div className={styles.tokenWrapper}>
            <Form.Control
              className={`${styles.input} ${styles.tokenInput}`}
              type={showPassword ? 'text' : 'password'}
              name="hf_api_key"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
            />
            <button type="button" className={styles.tokenIconButton} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
            </button>
          </div>
        </Form.Field>

        <Form.Field className={styles.field} name="hf_user_id">
          <div className={styles.messageContainer}>
            <Form.Label className={styles.label}>Hugging Face User Id</Form.Label>
          </div>

          <Form.Control
            className={`${styles.input}`}
            type="text"
            name="hf_user_id"
            value={localUserId}
            onChange={(e) => setLocalUserId(e.target.value)}
          />
        </Form.Field>

        <Form.Submit className={styles.submitButton} disabled={!isFormValid}>
          Save
        </Form.Submit>
      </Form.Root>
    </section>
  );
}
