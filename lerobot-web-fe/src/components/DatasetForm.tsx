import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as Form from '@radix-ui/react-form';
import { PlayIcon } from '@radix-ui/react-icons';
import { initFormData, type DatasetMetaData } from '../models/recordDataset.model';
import { useAiControlStore } from '../stores/aiControl.store';
import { useRobotStore } from '../stores/robot.store';

import styles from './DatasetForm.module.css';

export function DatasetForm({ onSubmit }: { onSubmit: (data: DatasetMetaData) => void }) {
  const [formData, setFormData] = useState<DatasetMetaData>(initFormData);
  const userId = useAiControlStore((state) => state.userId);
  const robots = useRobotStore((state) => state.robots);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isValid = Object.values(formData).every((v) => v.trim() !== '') && userId && robots?.length !== 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    const updatedData = { ...formData };
    updatedData.repoId = `${userId}/${formData.repoId}`;
    updatedData.numEpisodes = Number(formData.numEpisodes);
    updatedData.episodeTime = Number(formData.episodeTime);
    updatedData.resetTime = Number(formData.resetTime);
    onSubmit(updatedData);
  };

  return (
    <Form.Root className={styles.controlForm} onSubmit={handleSubmit}>
      <Form.Field className={styles.field} name="repoId">
        <div>
          <Form.Label className={styles.label}>ID for the new repo</Form.Label>
        </div>
        <div className={styles.inputBox}>
          <Link
            className={styles.link}
            to={{
              pathname: '/configuration',
            }}
          >
            <span className={styles.prefix}>{`${userId}/`}</span>
          </Link>

          <Form.Control
            className={`${styles.input}`}
            type="text"
            name="repoId"
            placeholder="repo-name"
            value={formData.repoId}
            onChange={handleChange}
            required
          />
        </div>
      </Form.Field>
      <Form.Field className={styles.field} name="numEpisodes">
        <div>
          <Form.Label className={styles.label}>Number of episodes</Form.Label>
        </div>

        <Form.Control
          className={`${styles.input}`}
          type="number"
          name="numEpisodes"
          placeholder="50"
          value={formData.numEpisodes}
          onChange={handleChange}
          required
        />
      </Form.Field>
      <Form.Field className={styles.field} name="episodeTime">
        <div>
          <Form.Label className={styles.label}>Episode time</Form.Label>
        </div>

        <div className={`${styles.inputBox} ${styles.reverse}`}>
          <span className={styles.prefix}>s</span>

          <Form.Control
            className={`${styles.input}`}
            type="number"
            name="episodeTime"
            placeholder="10"
            value={formData.episodeTime}
            onChange={handleChange}
            required
          />
        </div>
      </Form.Field>
      <Form.Field className={styles.field} name="resetTime">
        <div>
          <Form.Label className={styles.label}>Reset time</Form.Label>
        </div>

        <div className={`${styles.inputBox} ${styles.reverse}`}>
          <span className={styles.prefix}>s</span>

          <Form.Control
            className={`${styles.input}`}
            type="number"
            name="resetTime"
            placeholder="10"
            value={formData.resetTime}
            onChange={handleChange}
            required
          />
        </div>
      </Form.Field>
      <Form.Field className={styles.field} name="singleTask">
        <div>
          <Form.Label className={styles.label}>Describe a task</Form.Label>
        </div>

        <textarea
          className={`${styles.input} ${styles.textarea}`}
          name="singleTask"
          placeholder="Write down the task you want to record..."
          value={formData.singleTask}
          onChange={handleChange}
          required
        />
      </Form.Field>

      <Form.Submit className={styles.submitButton} disabled={!isValid}>
        <PlayIcon />
        Start
      </Form.Submit>
    </Form.Root>
  );
}
