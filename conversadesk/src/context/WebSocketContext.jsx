import React, { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const WebSocketContext = createContext();

export function useWebSocket() {
  return useContext(WebSocketContext);
}

export function WebSocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    const wsUrl = 'ws://127.0.0.1:8000/ws';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket Connected');
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        if (data.type === 'NEW_TICKET') {
          toast(data.message || 'New ticket generated from emails!', {
            icon: '🎫',
            style: { background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)' }
          });
        }
      } catch (err) {
        console.error('WebSocket message parsing error', err);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket Disconnected');
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}
