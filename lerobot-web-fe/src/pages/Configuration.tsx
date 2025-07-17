import { useState } from 'react';
import * as Form from '@radix-ui/react-form';
import { EyeClosedIcon, EyeOpenIcon } from '@radix-ui/react-icons';

import styles from './Configuration.module.css';

export default function Configuration() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <section className={styles.ConfigurationWrapper}>
      <h2 className={styles.Title}>Configuration</h2>
      <Form.Root className={styles.Form}>
        <Form.Field className={styles.Field} name="url">
          <div className={styles.MessageContainer}>
            <Form.Label className={styles.Label}>Backend Url</Form.Label>
            <Form.Message className={styles.ErrorMessage} match="valueMissing">
              Please enter a URL
            </Form.Message>
            <Form.Message className={styles.ErrorMessage} match="typeMismatch">
              Please provide a valid URL
            </Form.Message>
          </div>
          <Form.Control asChild>
            <input className={styles.Input} type="url" name="url" required />
          </Form.Control>
        </Form.Field>

        <Form.Field className={styles.Field} name="token">
          <div className={styles.MessageContainer}>
            <Form.Label className={styles.Label}>Hugging Face Token</Form.Label>
            <Form.Message className={styles.ErrorMessage} match="valueMissing">
              Please enter a token
            </Form.Message>
          </div>
          <div className={styles.TokenWrapper}>
            <Form.Control asChild>
              <input className={`${styles.Input} ${styles.TokenInput}`} type={showPassword ? 'text' : 'password'} name="token" required />
            </Form.Control>
            <button type='button' className={styles.TokenIconButton} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
            </button>
          </div>
        </Form.Field>
        <Form.Submit asChild>
          <button type='submit' className={styles.SubmitButton}>
            Save
          </button>
        </Form.Submit>
      </Form.Root>
    </section>
  );
}
