import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { format } from 'date-fns';
import Markdown from 'react-markdown';
import type { ChatHistoryItem } from '../models/chat.model';

import styles from './ChatEntry.module.css';

const MESSAGE_LENGTH_LIMIT = 500;

export const ChatEntry = ({ item }: { item: ChatHistoryItem }) => {
  const [isLongText, setIsLongText] = useState(false);
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasOverflow = item.text && item.text.length > MESSAGE_LENGTH_LIMIT;
    setIsLongText(hasOverflow || false);
  }, [item.text]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) {
      return;
    }
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

    setShowTopGradient(scrollTop > 0);
    setShowBottomGradient(scrollTop + clientHeight < scrollHeight);
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return () => {};
    }

    handleScroll();

    const handleScrollEvent = () => {
      handleScroll();
    };
    el.addEventListener('scroll', handleScrollEvent);

    const resizeObserver = new ResizeObserver(() => {
      handleScroll();
    });
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', handleScrollEvent);
      resizeObserver.disconnect();
    };
  }, [handleScroll]);

  const renderText = () => (
    <div
      key={item.key}
      className={`${styles.historyMessage} ${styles[item.side]} ${isLongText ? styles.long : ''} ${showBottomGradient ? styles.showBottomGradient : ''} ${
        showTopGradient ? styles.showTopGradient : ''
      }`}
      title={format(item.added, 'yyyy-MM-dd HH:mm:ss')}
      ref={containerRef}
    >
      <Markdown disallowedElements={['h1', 'h2', 'h3']} unwrapDisallowed>
        {item.text}
      </Markdown>
    </div>
  );

  return <>{item.text && renderText()}</>;
};
