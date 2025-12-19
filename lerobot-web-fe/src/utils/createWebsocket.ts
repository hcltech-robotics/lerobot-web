export function createWebSocket(url: URL, onMessage: (event: MessageEvent) => void, onOpen?: () => void, onClose?: () => void): WebSocket {
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';

  const websocket = new WebSocket(url.toString());

  websocket.onopen = () => {
    console.log(`WebSocket opened: ${websocket.url}`);
    onOpen?.();
  };

  websocket.onmessage = onMessage;

  websocket.onclose = () => {
    console.log(`WebSocket closed: ${websocket.url}`);
    onClose?.();
  };

  return websocket;
}
