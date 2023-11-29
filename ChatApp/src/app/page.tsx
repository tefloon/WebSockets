import ChatWindow from "@/components/webSocketComponents/chatComponents/chatWindow";
import { WebSocketProvider } from "@/components/webSocketComponents/webSocketContext";
import React from "react";

export default function Home() {
  return (
    <WebSocketProvider>
      <main className="h-full">
        <h1 className="text-center text-2xl py-10">Chat</h1>
        <div className="flex flex-col items-center h-[800px]">
          <ChatWindow />
        </div>
      </main>
    </WebSocketProvider>
  );
}
