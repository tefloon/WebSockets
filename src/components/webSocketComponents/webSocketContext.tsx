"use client";

// WebSocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { MessageHandler, EventHandler, useWebSocket } from "./useWebsocket";

interface WebSocketContextProps {
  isConnected: boolean;
  send: (message: string) => void;
  onMessage: (handler: MessageHandler) => () => void;
  onOpen: (handler: EventHandler) => () => void;
  onClose: (handler: EventHandler) => () => void;
  onError: (handler: EventHandler) => () => void;
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
  const { isConnected, send, onMessage, onOpen, onClose, onError } =
    useWebSocket("ws://localhost:8080");

  return (
    <WebSocketContext.Provider
      value={{ isConnected, send, onMessage, onOpen, onClose, onError }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
