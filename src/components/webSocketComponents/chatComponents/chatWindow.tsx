"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { useWebSocketContext } from "../webSocketContext";
import { ChatMessageType } from "@/lib/types";
import ChatMessageComponent from "./chatMessage";
import { createId } from "@paralleldrive/cuid2";
import { flushSync } from "react-dom";

export default function ChatWindow() {
  const DEFAULT_MAX_VISIBLE_MESSAGES = 20;
  const MAX_MESSAGES_CAP = 40;

  const { send, onMessage } = useWebSocketContext();

  const [visibleMessages, setVisibleMessages] = useState(
    DEFAULT_MAX_VISIBLE_MESSAGES
  );
  const [chatMessages, setChatMessages] = useState<ChatMessageType[]>([]);

  const [currentScrollTop, setCurrentScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);

  const [canLoadOlder, setCanLoadOlder] = useState(true);

  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatMessagesRef = useRef(chatMessages);
  const visibleMessagesRef = useRef(visibleMessages);
  const canLoadOlderRef = useRef(canLoadOlder);
  const hasScrolled = useRef(false);
  const isAutoScroll = useRef(true);

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
        if (isAutoScroll.current) {
          isAutoScroll.current = false;
        } else {
          hasScrolled.current = true;
        }
        setCurrentScrollTop(containerRef.current.scrollTop);
        setClientHeight(containerRef.current.clientHeight);
        setScrollHeight(containerRef.current.scrollHeight);
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
            ? [...[...prevMessages.slice(-MAX_MESSAGES_CAP + 1), newMessage]]
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

  const isAtBottom = (threshold: number) => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
    const isAtBottom = scrollTop + clientHeight + threshold >= scrollHeight;

    return isAtBottom;
  };

  const scrollToLastMessage = (forced = false) => {
    const scrollThreshold = 50;

    if (!listRef.current) return;

    const lastMessage = listRef.current.lastElementChild;
    let lastMessageHeight = 0;

    if (lastMessage && lastMessage instanceof HTMLLIElement) {
      lastMessageHeight = lastMessage.offsetHeight;

      if (
        isAtBottom(lastMessageHeight + scrollThreshold) ||
        !hasScrolled ||
        forced
      ) {
        isAutoScroll.current = true;

        lastMessage.scrollIntoView({
          behavior: "instant",
          block: "end",
          inline: "nearest",
        });
      }
    }
  };

  const loadOlderMessages = () => {
    if (!canLoadOlderRef.current) return;
    if (!visibleMessagesRef.current) return;
    if (!containerRef.current) return;

    if (chatMessagesRef.current.length < DEFAULT_MAX_VISIBLE_MESSAGES) return;
    if (visibleMessagesRef.current >= chatMessagesRef.current.length) return;

    const scrollThreshold = 200;
    // Define a threshold (e.g., 150px) to consider user is at the bottom
    const { scrollTop, scrollHeight } = containerRef.current;

    if (scrollTop < scrollThreshold) {
      setVisibleMessages((prev) => prev + DEFAULT_MAX_VISIBLE_MESSAGES);
      containerRef.current.scrollTo(0, scrollHeight / 2);
      setCanLoadOlder(false);
      setTimeout(() => setCanLoadOlder(true), 2000);
    }
  };

  const scrollBtnBaseClass =
    "absolute bottom-40 left-1/2 -translate-x-1/2 px-5 py-3 bg-slate-900/25 hover:bg-slate-900/75 rounded-full";

  let scrollBtnClass =
    currentScrollTop < scrollHeight - clientHeight - 100
      ? scrollBtnBaseClass
      : "hidden";

  return (
    <div className="flex flex-col h-[800px] w-1/3 gap-5 relative">
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
      <button
        className={scrollBtnClass}
        onClick={() => scrollToLastMessage(true)}
      >
        Scroll Down
      </button>
      <div>
        {/* Sending form */}
        {/* TODO: Extract form to a separate component */}
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
        <span>
          {currentScrollTop} + {clientHeight} = {scrollHeight}
        </span>
        <span>{hasScrolled.current.toString()}</span>
        <span>
          {visibleMessages} / {chatMessages.length}
        </span>
      </div>
    </div>
  );
}
