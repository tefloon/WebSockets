// useWebSocket.ts
import { useState, useEffect, useCallback } from "react";

export type MessageHandler = (event: MessageEvent) => void;

export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socketInstance = new WebSocket(url);

    socketInstance.onopen = () => {
      console.log("WebSocket connected");
    };

    setSocket(socketInstance);

    return () => {
      socketInstance.close();
    };
  }, [url]);

  const send = useCallback(
    (message: string) => {
      socket?.send(message);
    },
    [socket]
  );

  const onMessage = useCallback(
    (handler: MessageHandler) => {
      socket?.addEventListener("message", handler);

      return () => {
        socket?.removeEventListener("message", handler);
      };
    },
    [socket]
  );

  return {
    send,
    onMessage,
  };
};
