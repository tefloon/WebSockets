"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useWebSocketContext } from "../webSocketContext";
import { ChatMessageType } from "@/lib/types";
import ChatMessageComponent from "./chatMessage";
import { createId } from "@paralleldrive/cuid2";
import { flushSync } from "react-dom";

export default function ChatWindow() {
  const DEFAULT_MAX_VISIBLE_MESSAGES = 20;
  const MAX_MESSAGES_CAP = 100;

  const { send, onMessage } = useWebSocketContext();

  const [visibleMessages, setVisibleMessages] = useState(
    DEFAULT_MAX_VISIBLE_MESSAGES
  );
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);
  const [currentScrollTop, setCurrentScrollTop] = useState(0);
  const [canLoadOlder, setCanLoadOlder] = useState(true);

  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatMessagesRef = useRef(chatMessages);
  const visibleMessagesRef = useRef(visibleMessages);
  const canLoadOlderRef = useRef(canLoadOlder);

  const [userName, setUsername] = useState("");

  // =========== //
  //   EFFECTS   //
  // =========== //

  // Assiging random Username
  useEffect(() => {
    setUsername(`User${Math.floor(Math.random() * 1000)}`);
  }, []);

  // Registering event listeners for scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        setCurrentScrollTop(containerRef.current.scrollTop);
        loadOlderMessages();
      }
    };

    const scrollableElement = containerRef.current;
    if (scrollableElement) {
      scrollableElement.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollableElement) {
        scrollableElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, [listRef.current]);

  // Registering the ref to chatMessages
  useEffect(() => {
    chatMessagesRef.current = chatMessages;
  }, [chatMessages]);

  useEffect(() => {
    canLoadOlderRef.current = canLoadOlder;
  }, [canLoadOlder]);

  useEffect(() => {
    visibleMessagesRef.current = visibleMessages;
  }, [visibleMessages]);

  // Registering new message callback
  useEffect(() => {
    const unsubscribe = onMessage((event) => {
      const newMessage: ChatMessageType = JSON.parse(event.data);
      flushSync(() => {
        setChatMessages((prevMessages) =>
          prevMessages
            ? [...[...prevMessages, newMessage].slice(-MAX_MESSAGES_CAP)]
            : [newMessage]
        );
      });
      scrollToLastMessage();
    });

    return () => unsubscribe();
  }, [onMessage]);

  // =========== //
  //   HANDLERS  //
  // =========== //

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

  // ============ //
  //   FUNCTIONS  //
  // ============ //

  const scrollToLastMessage = () => {
    if (!listRef.current) return;
    if (!containerRef.current) return;
    const scrollThreshold = 150;
    // Define a threshold (e.g., 150px) to consider user is at the bottom
    const { scrollTop, clientHeight, scrollHeight } = containerRef.current;

    const isAtBottom =
      scrollTop + clientHeight + scrollThreshold >= scrollHeight;

    if (isAtBottom) {
      let lastChild = listRef.current.lastElementChild;
      lastChild?.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      });
    }
  };

  const loadOlderMessages = () => {
    if (!canLoadOlderRef.current) return;
    if (!visibleMessagesRef.current) return;
    if (!listRef.current || !containerRef.current) return;

    if (chatMessagesRef.current.length < DEFAULT_MAX_VISIBLE_MESSAGES) return;
    if (visibleMessagesRef.current > chatMessagesRef.current.length) return;

    const scrollThreshold = 150;
    // Define a threshold (e.g., 150px) to consider user is at the bottom
    const { scrollTop, scrollHeight } = containerRef.current;

    if (scrollTop < scrollThreshold) {
      setVisibleMessages((prev) => prev + DEFAULT_MAX_VISIBLE_MESSAGES);
      containerRef.current.scrollTo(0, scrollHeight / 2);
      setCanLoadOlder(false);
      setTimeout(() => setCanLoadOlder(true), 2000);
    }
  };

  return (
    <div className="flex flex-col h-[800px] w-1/3 gap-5">
      <div
        className="h-full overflow-y-auto overflow-x-hidden scroll-smooth"
        ref={containerRef}
      >
        {/* List of messages */}
        {chatMessages && (
          <ul className="flex flex-col gap-2" ref={listRef}>
            {chatMessages.slice(-visibleMessages).map((msg) => (
              <li key={msg.id}>
                <ChatMessageComponent {...msg} />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        {/* Sending form */}
        <form className="flex flex-row" onSubmit={handleSendMessage}>
          <button className="flex-none bg-slate-900 text-slate-400 p-5 ">
            Send Message
          </button>

          <input
            className="grow text-xl text-slate-900 bg-slate-400 p-4"
            type="text"
            name="chatMessageInput"
            id="chatMessageInput"
            ref={inputRef}
          />
        </form>
      </div>
      <div className="flex flex-row justify-between">
        <span>{currentScrollTop}</span>
        <span>
          {visibleMessages} / {chatMessages.length}
        </span>
      </div>
    </div>
  );
}
