import { addSeconds } from 'date-fns';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ChatHistoryItem } from '../models/chat.model';

const calcReadingTime = (item: ChatHistoryItem) => {
  const WORD_PER_MINUTE = 300;
  const WORD_PER_SECOND = WORD_PER_MINUTE / 60;
  if (item.text) {
    return Math.ceil(item.text.split(/\s/).length / WORD_PER_SECOND);
  }

  return 1;
};

export interface ChatHistoryState {
  history: ChatHistoryItem[];
  lastMessage: ChatHistoryItem | undefined;
}

export interface ChatHistoryActions {
  addTextMessage: (query: string, origin?: ChatHistoryItem['side']) => void;
}

export const useChatHistoryStore = create<ChatHistoryState & ChatHistoryActions>()(
  immer((set) => ({
    history: [],
    lastMessage: undefined,
    addTextMessage: (query: string, origin: ChatHistoryItem['side'] = 'me') => {
      set((state: ChatHistoryState) => {
        const newHistoryItem: ChatHistoryItem = {
          text: query,
          side: origin,
          added: new Date(),
          key: Math.random() * 1e12,
          hide: new Date(),
        };

        const lastHideTime = state.history[state.history.length - 1]?.hide ?? new Date();
        newHistoryItem.hide = addSeconds(
          lastHideTime.getTime() <= new Date().getTime() ? new Date() : lastHideTime,
          calcReadingTime(newHistoryItem) + 1,
        );

        state.lastMessage = newHistoryItem;
        state.history.push(newHistoryItem);
      });
    },
  })),
);
