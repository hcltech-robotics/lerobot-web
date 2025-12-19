import React from 'react';

import styles from './ChatTypingIndicator.module.css';

export const ChatTypingIndicator: React.FC<{ isTyping: boolean }> = ({ isTyping }) => {
  return (
    <>
      <div className={`${styles.typingTextWrapper} ${isTyping ? styles.show : ''}`}>
        <div className={styles.typingText}>
          <span>Thinking</span>
          <div className={styles.typingIndicatorWrapper}>
            <div className={styles.typingIndicator}>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
              <span className={styles.dot}></span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
