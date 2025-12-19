import { useRef, useState } from 'react';
import { ChatInput } from '../components/ChatInput';
import { ChatHistory } from '../components/ChatHistory';
import { useChatHistoryStore } from '../stores/chat.store';
import { createGrootWebSocket, startGroot, stopGroot } from '../services/inference.service';
import { useRobotStore } from '../stores/robot.store';
import { getFollowerBySide } from '../services/robot.service';
import { robotSideList } from '../models/robot.model';
import { ToastType, useToastStore } from '../stores/toast.store';

import styles from './ChatControl.module.css';

export default function ChatControl() {
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const addTextMessage = useChatHistoryStore((state) => state.addTextMessage);
  const robotType = useRobotStore((state) => state.robotType);
  const robots = useRobotStore((state) => state.robots);
  const addToast = useToastStore((state) => state.addToast);
  const wsRef = useRef<WebSocket | null>(null);
  const follower = getFollowerBySide(robots || [], robotSideList.LEFT)[0];

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const sendMessage = (message: string) => {
    sendQueryToLlm(message);
  };

  const sendQueryToLlm = async (query: string, showUserMessage = true) => {
    if (!follower) {
      console.error('[ERROR: CHAT] Follower arm is missing');
      addToast({
        type: ToastType.Error,
        title: 'Error!',
        description: 'Follower arm is missing',
      });
      return;
    }

    if (showUserMessage) {
      addTextMessage(query);
    }

    try {
      setIsTyping(true);
      await startGroot({ lang_instruction: query, robot_port: follower, robot_type: robotType });

      wsRef.current?.close();
      wsRef.current = createGrootWebSocket('/ai-control/groot/stream', async (response) => {
        setIsTyping(false);
        if (response.includes('[GROOT]')) {
          await stop();
          return;
        }
        addTextMessage(response, 'other');
      });
    } catch (error) {
      setIsTyping(false);
      console.error('[ERROR: CHAT] Error in chat communication:', error);
      addToast({
        type: ToastType.Error,
        title: 'Error!',
        description: 'Error in chat communication',
      });
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
