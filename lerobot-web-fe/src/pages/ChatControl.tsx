import { useRef, useState } from 'react';
import { ChatInput } from '../components/ChatInput';
import { ChatHistory } from '../components/ChatHistory';
import { useChatHistoryStore } from '../stores/chat.store';
import { createGrootWebSocket, startGroot, stopGroot } from '../services/aiControl.service';

import styles from './ChatControl.module.css';

export default function ChatControl() {
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const addTextMessage = useChatHistoryStore((state) => state.addTextMessage);
  const wsRef = useRef<WebSocket | null>(null);

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
      await startGroot(query);

      wsRef.current?.close();
      wsRef.current = createGrootWebSocket(
        '/ai-control/groot/stream',
        (response) => {
          addTextMessage(response, 'other');
          if (response.includes('[GROOT]')) {
            stop();
          }
        },
        () => console.log('[LOG: CHAT] Groot stream opened'),
        () => console.log('[LOG: CHAT] Groot stream closed'),
      );
    } catch (error) {
      console.error('[ERROR: CHAT] Error in chat communication:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const stop = async () => {
    await stopGroot();
    wsRef.current?.close();
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
