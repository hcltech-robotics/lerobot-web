import { useRef, useState, type FormEventHandler, type KeyboardEventHandler } from 'react';
import { CounterClockwiseClockIcon, Cross1Icon, PaperPlaneIcon } from '@radix-ui/react-icons';

import styles from './ChatInput.module.css';

export const ChatInput = ({
  showHistory,
  toggleHistory,
  sendMessage,
}: {
  showHistory: boolean;
  toggleHistory: () => void;
  sendMessage: (message: string) => void;
}) => {
  const [input, setInput] = useState('');

  const textarea = useRef<HTMLTextAreaElement>(null);
  const form = useRef<HTMLFormElement>(null);

  const adjustHeight = (node: HTMLTextAreaElement | null) => {
    if (node) {
      node.style.height = '1.2em';
      if (node.scrollHeight > 36) {
        node.style.height = `${node.scrollHeight}px`;
      }
    }
  };

  const handleInputChange: FormEventHandler<HTMLTextAreaElement> = (event) => {
    setInput(event.currentTarget.value);
    adjustHeight(textarea.current);
  };

  const handleKeyPress: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.current?.requestSubmit();
    }
    if (event.key === 'Escape') {
      textarea.current?.select();
    }
  };

  const setInputValue = (value: string = '') => {
    setInput(value);
    if (textarea.current) {
      textarea.current.value = value;
      adjustHeight(textarea.current);
    }
  };

  const clearInput = () => {
    setInputValue('');
  };

  const submitForm: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (textarea.current) {
      const query = textarea.current.value.trim();
      if (query) {
        sendMessage(query);
        clearInput();
      }
    }
  };

  return (
    <form className={styles.chatForm} ref={form} onSubmit={submitForm}>
      <div className={styles.chatControls}>
        <textarea
          id="q"
          className={styles.chatTextarea}
          placeholder="Chat with the robot..."
          onInput={handleInputChange}
          onKeyDown={handleKeyPress}
          ref={textarea}
        ></textarea>
        {input.length > 0 && (
          <button type="button" className={styles.chatButton} onClick={clearInput}>
            <Cross1Icon />
          </button>
        )}
        <button type="submit" className={styles.chatButton} disabled={input.trim().length === 0}>
          <PaperPlaneIcon />
        </button>

        <button
          type="button"
          className={`${styles.chatButton} ${showHistory ? styles.active : ''}`}
          onClick={toggleHistory}
          disabled={history.length === 0}
        >
          <CounterClockwiseClockIcon />
        </button>
      </div>
    </form>
  );
};
