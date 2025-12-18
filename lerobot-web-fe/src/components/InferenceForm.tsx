import { useMemo, useState } from 'react';
import * as Form from '@radix-ui/react-form';
import { PlayIcon } from '@radix-ui/react-icons';
import { initFormData, type InferenceMetaData, type InferenceFormProps } from '../models/aiControl.model';
import { useRobotStore } from '../stores/robot.store';
import { Selector } from './Selector';
import ToggleSwitch, { type ToggleSwitchChange } from './ToggleSwitch';
import { robotRoleList, robotSideList, type RobotItem } from '../models/robot.model';

import styles from './InferenceForm.module.css';

export function InferenceForm({ remoteModels, isRunning, onSubmit }: InferenceFormProps) {
  const [formData, setFormData] = useState<InferenceMetaData>(initFormData);
  const [isRemoteModelSource, setIsRemoteModelSource] = useState(false);
  const isBimanualMode = useRobotStore((store) => store.isBimanualMode);

  const robots = useRobotStore((state) => state.robots);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const followers = useMemo(() => {
    if (!robots) return [];

    const allFollowers = robots.filter((robot) => robot.role === robotRoleList.FOLLOWER);

    if (isBimanualMode) {
      const left = allFollowers.find((follower) => follower.side === robotSideList.LEFT);
      const right = allFollowers.find((follower) => follower.side === robotSideList.RIGHT);
      return [left, right].filter(Boolean) as RobotItem[];
    }

    const left = allFollowers.find((follower) => follower.side === robotSideList.LEFT);
    return left ? [left] : [];
  }, [robots, isBimanualMode]);

  const numericEpisodeTimeS = Number(formData.episodeTime);
  const isModelOrPathFilled = !!formData.remoteModel || !!formData.policyPathLocal;
  const areRequiredFieldsFilled = !!formData.repoId && !!formData.singleTask && numericEpisodeTimeS > 0;

  const isFormValid = isModelOrPathFilled && areRequiredFieldsFilled && followers.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      return;
    }

    const updatedData = { ...formData };
    updatedData.episodeTime = Number(formData.episodeTime);
    onSubmit(updatedData);
  };

  const setSelectedRemoteModel = (model: string) => {
    setFormData({ ...formData, remoteModel: model });
  };

  const handleRemoteModelSwitcher = (isRemote: ToggleSwitchChange) => {
    setIsRemoteModelSource(isRemote.change);
    const updatedData = { ...formData };
    if (isRemote.change) {
      updatedData.policyPathLocal = '';
    } else {
      updatedData.remoteModel = '';
    }

    setFormData(updatedData);
  };

  return (
    <Form.Root className={styles.controlForm} onSubmit={handleSubmit}>
      <Form.Field className={styles.field} name="repoId">
        <div>
          <Form.Label className={styles.label}>ID for the repo</Form.Label>
        </div>
        <div className={styles.inputBox}>
          <Form.Control
            className={`${styles.input}`}
            type="text"
            name="repoId"
            placeholder="example-id"
            value={formData.repoId}
            onChange={handleChange}
            disabled={isRunning}
            required
          />
        </div>
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
            disabled={isRunning}
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
          placeholder="Write a task you want to start..."
          value={formData.singleTask}
          onChange={handleChange}
          disabled={isRunning}
          required
        />
      </Form.Field>
      <Form.Field className={styles.field} name="modelSwitcher">
        <div>
          <Form.Label className={styles.label}>Select a source for model</Form.Label>
        </div>
        <ToggleSwitch
          checked={isRemoteModelSource}
          disabled={isRunning || remoteModels.length === 0}
          labels={['Local', 'Remote']}
          onChange={handleRemoteModelSwitcher}
        />
      </Form.Field>
      {isRemoteModelSource && (
        <Form.Field className={styles.field} name="remoteModel">
          <div>
            <Form.Label className={styles.label}>Select a remote model</Form.Label>
          </div>
          <Selector
            options={remoteModels}
            selected={formData.remoteModel}
            onChange={setSelectedRemoteModel}
            disabled={isRunning}
            showLabel={false}
          />
        </Form.Field>
      )}
      {!isRemoteModelSource && (
        <Form.Field className={styles.field} name="policyPathLocal">
          <div>
            <Form.Label className={styles.label}>Local policy path</Form.Label>
          </div>
          <div className={styles.inputBox}>
            <Form.Control
              className={`${styles.input}`}
              type="text"
              name="policyPathLocal"
              placeholder="Enter the full path of the folder"
              value={formData.policyPathLocal}
              disabled={isRunning}
              onChange={handleChange}
            />
          </div>
        </Form.Field>
      )}

      {!isRunning && (
        <Form.Submit className={styles.submitButton} disabled={!isFormValid}>
          <PlayIcon />
          Start
        </Form.Submit>
      )}
    </Form.Root>
  );
}
