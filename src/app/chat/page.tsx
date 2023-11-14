import ChatWindow from "@/components/webSocketComponents/chatComponents/chatWindow";
import { WebSocketProvider } from "@/components/webSocketComponents/webSocketContext";
import React from "react";

export default function Chat() {
  return (
    <WebSocketProvider>
      <h1>Chat Page Component</h1>
      <div className="flex flex-col items-center">
        <ChatWindow />
      </div>
    </WebSocketProvider>
  );
}
