import React, { useEffect, useRef, useState } from 'react';
import { differenceInSeconds } from 'date-fns';
import { useChatHistoryStore } from '../stores/chat.store';
import { ChatTypingIndicator } from './ChatTypingIndicator';
import { useInterval } from '../utils/timeHooks';
import { ChatEntry } from './ChatEntry';

import styles from './ChatHistory.module.css';

interface ChatHistoryProps {
  showHistory: boolean;
  isTyping: boolean;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ showHistory, isTyping }) => {
  const [historyStart, setHistoryStart] = useState<number>(-1);
  const history = useChatHistoryStore((state) => state.history);
  const historyNode = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyNode.current) {
      historyNode.current.scrollTop = historyNode.current.scrollHeight;
    }
  }, [history, showHistory]);

  const calcHistory = (lHistory: any[]): number => {
    const historyStart = lHistory.findIndex((item) => differenceInSeconds(item.hide, new Date()) > 0);

    return historyStart;
  };

  useInterval(() => {
    setHistoryStart(calcHistory(history));
  }, 1000);

  useEffect(() => {
    setHistoryStart(calcHistory(history));
  }, [history]);

  return (
    <>
      {history.length > 0 && showHistory ? (
        <div className={styles.chatHistory}>
          <div className={styles.historyEntries} ref={historyNode}>
            {history.map((item) => (
              <ChatEntry key={item.key} item={item} />
            ))}
          </div>
          <ChatTypingIndicator isTyping={isTyping} />
        </div>
      ) : (
        <div className={styles.chatRecent}>
          <div className={styles.historyEntries} ref={historyNode}>
            {historyStart >= 0 ? history.slice(historyStart).map((item) => <ChatEntry key={item.key} item={item} />) : ''}
          </div>
          <ChatTypingIndicator isTyping={isTyping} />
        </div>
      )}
    </>
  );
};
