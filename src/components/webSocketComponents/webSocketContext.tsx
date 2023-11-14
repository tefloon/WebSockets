"use client";

// WebSocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { MessageHandler, useWebSocket } from "./useWebsocket";

interface WebSocketContextProps {
  send: (message: string) => void;
  onMessage: (handler: MessageHandler) => () => void;
}

const WebSocketContext = createContext<WebSocketContextProps | null>(null);

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error(
      "useWebSocketContext must be used within a WebSocketProvider"
    );
  }
  return context;
};

type WebSocketProviderProps = {
  children: React.ReactNode;
};

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { send, onMessage } = useWebSocket("ws://localhost:8080");

  return (
    <WebSocketContext.Provider value={{ send, onMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}
