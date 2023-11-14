"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useWebSocketContext } from "../webSocketContext";
import { ChatMessageType } from "@/lib/types";
import ChatMessageComponent from "./chatMessage";
import { createId } from "@paralleldrive/cuid2";
import { flushSync } from "react-dom";

export default function ChatWindow() {
  const { send, onMessage } = useWebSocketContext();
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>();
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [userName, setUsername] = useState("");

  useEffect(() => {
    setUsername(`User${Math.floor(Math.random() * 1000)}`);
  }, []);

  const handleSendMessage = (event: FormEvent) => {
    event.preventDefault();

    if (!inputRef.current) return;
    if (inputRef.current.value === "") return;

    const messageToSend: ChatMessageType = {
      id: createId(),
      userName: userName,
      message: inputRef.current.value,
      color: "#adadFF",
    };

    send(JSON.stringify(messageToSend));
    inputRef.current.value = "";
  };

  const scrollToLastMessage = () => {
    let lastChild = listRef.current!.lastElementChild;
    lastChild?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  useEffect(() => {
    const unsubscribe = onMessage((event) => {
      const newMessage: ChatMessageType = JSON.parse(event.data);
      flushSync(() => {
        setChatMessages((prevMessages) =>
          prevMessages ? [...prevMessages, newMessage] : [newMessage]
        );
      });
      scrollToLastMessage();
    });

    return () => unsubscribe();
  }, [onMessage]);

  return (
    <div className="h-[800px] w-1/3">
      <div className="h-full overflow-y-auto overflow-x-hidden scroll-smooth">
        {chatMessages && (
          <ul className="flex flex-col gap-5" ref={listRef}>
            {chatMessages.map((msg) => (
              <li key={msg.id}>
                <ChatMessageComponent {...msg} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <form className="flex flex-row" onSubmit={handleSendMessage}>
          <button className="flex-none bg-slate-900 text-slate-400 p-5 rounded">
            Send Message
          </button>

          <input
            className="grow h-full text-slate-900 bg-slate-400 p-5"
            type="text"
            name="chatMessageInput"
            id="chatMessageInput"
            ref={inputRef}
          />
        </form>
      </div>
    </div>
  );
}
