// useWebSocket.ts
import { useState, useEffect, useCallback, useRef } from "react";

export type MessageHandler = (event: MessageEvent) => void;
export type EventHandler = (event: Event) => void;

export const useWebSocket = (url: string) => {
  const MAX_RECONNECT_ATTEMPTS = 10;
  const INITIAL_RECONNECT_TIMEOUT = 500;

  const reconnectAttempts = useRef(0);
  const currentReconnectTimeout = useRef(INITIAL_RECONNECT_TIMEOUT);

  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    socketRef.current = new WebSocket(url);

    socketRef.current.onopen = () => {
      console.log("WebSocket connected");
      setIsConnected(true);
      reconnectAttempts.current = 0;
      currentReconnectTimeout.current = INITIAL_RECONNECT_TIMEOUT;
    };

    socketRef.current.onclose = () => {
      setIsConnected(false);
      console.log(
        `onclose: current timeout before setTimeout: ${currentReconnectTimeout.current}`
      );

      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        setTimeout(() => {
          console.log(
            `setTimeout callback: current timeout: ${currentReconnectTimeout.current}`
          );
          reconnectAttempts.current += 1;
          currentReconnectTimeout.current *= 2;
          connect();
        }, currentReconnectTimeout.current);

        console.log(
          `onclose: current timeout after setTimeout: ${currentReconnectTimeout.current}`
        );
      } else {
        console.log("Max reconnect attempts reached");
      }
    };
  }, [url]);

  useEffect(() => {
    if (
      !socketRef.current ||
      socketRef.current.readyState === WebSocket.CLOSED
    ) {
      connect();
    }

    return () => {
      socketRef.current?.close();
    };
  }, [connect]);

  const send = useCallback(
    (message: string) => {
      socketRef.current?.send(message);
    },
    [isConnected]
  );

  const onMessage = useCallback(
    (handler: MessageHandler) => {
      socketRef.current?.addEventListener("message", handler);

      return () => {
        socketRef.current?.removeEventListener("message", handler);
      };
    },
    [isConnected]
  );
  const onError = useCallback(
    (handler: EventHandler) => {
      socketRef.current?.addEventListener("error", handler);
      return () => socketRef.current?.removeEventListener("error", handler);
    },
    [isConnected]
  );

  const onOpen = useCallback(
    (handler: EventHandler) => {
      socketRef.current?.addEventListener("open", handler);
      return () => socketRef.current?.removeEventListener("open", handler);
    },
    [isConnected]
  );

  const onClose = useCallback(
    (handler: EventHandler) => {
      socketRef.current?.addEventListener("close", handler);
      return () => socketRef.current?.removeEventListener("close", handler);
    },
    [isConnected]
  );

  return {
    isConnected,
    send,
    onMessage,
    onError,
    onOpen,
    onClose,
  };
};
