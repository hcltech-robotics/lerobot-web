import { useState } from 'react';
import { ChatInput } from '../components/ChatInput';
import { ChatHistory } from '../components/ChatHistory';
import { useChatHistoryStore } from '../stores/chat.store';

import styles from './ChatControl.module.css';

export default function ChatControl() {
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const addTextMessage = useChatHistoryStore((state) => state.addTextMessage);

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const sendMessage = (message: string) => {
    sendQueryToLlm(message);
  };

  const sendQueryToLlm = async (query: string, showUserMessage = true) => {
    if (showUserMessage) {
      addTextMessage(query);
    }

    setIsTyping(true);

    try {
      /* TODO: response for chat simulation */
      setTimeout(() => {
        setIsTyping(false);
        addTextMessage('response', 'other');
        console.log('other response');
      }, 500);
    } catch (error) {
      console.error('[ERROR: LLM] Error in chat communication:', error);
      setIsTyping(false);
    }
  };

  return (
    <div className={styles.contentArea}>
      <div className={styles.chatWrapper}>
        <ChatHistory showHistory={showHistory} isTyping={isTyping} />
        <ChatInput showHistory={showHistory} toggleHistory={toggleHistory} sendMessage={sendMessage} />
      </div>
    </div>
  );
}
